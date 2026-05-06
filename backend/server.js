import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Authentication API ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { type, fname, lname, phone, email, password } = req.body;

  if (type === 'buyer') {
    const sql = `INSERT INTO Buyer (buyer_fname, buyer_lname, buyer_phone, buyer_email, buyer_password) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [fname, lname, phone, email, password], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Buyer registered', id: this.lastID });
    });
  } else if (type === 'seller') {
    const sql = `INSERT INTO Seller (sellr_fname, sellr_lname, sellr_phone, sellr_email, sellr_password) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [fname, lname, phone, email, password], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Seller registered', id: this.lastID });
    });
  } else {
    res.status(400).json({ error: 'Invalid user type' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { type, email, password } = req.body;

  if (type === 'buyer') {
    const sql = `SELECT * FROM Buyer WHERE buyer_email = ? AND buyer_password = ?`;
    db.get(sql, [email, password], (err, user) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Login successful', user: { ...user, role: 'buyer' } });
    });
  } else if (type === 'seller') {
    const sql = `SELECT * FROM Seller WHERE sellr_email = ? AND sellr_password = ?`;
    db.get(sql, [email, password], (err, user) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Login successful', user: { ...user, role: 'seller' } });
    });
  } else {
    res.status(400).json({ error: 'Invalid user type' });
  }
});

// --- Buyer APIs ---

// Add Address
app.post('/api/addresses', (req, res) => {
  const { buyer_id, street, city, country, pcode } = req.body;
  const sql = `INSERT INTO BuyerAddress (buyer_id, baddr_street, baddr_city, baddr_country, baddr_pcode) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [buyer_id, street, city, country, pcode], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Address added', id: this.lastID });
  });
});

// Get Addresses for Buyer
app.get('/api/addresses/:buyer_id', (req, res) => {
  db.all(`SELECT * FROM BuyerAddress WHERE buyer_id = ?`, [req.params.buyer_id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// --- Bidding & Offers ---

// Place Bid
app.post('/api/bids', (req, res) => {
  const { listg_id, buyer_id, amount } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const sql = `INSERT INTO Bid (listg_id, buyer_id, bid_amount, bid_date, bid_status) VALUES (?, ?, ?, ?, 'Active')`;
  db.run(sql, [listg_id, buyer_id, amount, date], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    
    // Update listing startprice to new highest bid for convenience
    db.run(`UPDATE Listing SET listg_startprice = ? WHERE listg_id = ?`, [amount, listg_id]);
    res.json({ message: 'Bid placed', id: this.lastID });
  });
});

// Make Best Offer
app.post('/api/offers', (req, res) => {
  const { listg_id, buyer_id, amount } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const sql = `INSERT INTO BestOffer (listg_id, buyer_id, bstof_amount, bstof_date, bstof_status) VALUES (?, ?, ?, ?, 'Pending')`;
  db.run(sql, [listg_id, buyer_id, amount, date], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Offer submitted', id: this.lastID });
  });
});

// --- Orders & Payment ---

// Create Order (Buy Now)
app.post('/api/orders', (req, res) => {
  const { buyer_id, baddr_id, listg_id, quantity, price, payment_method } = req.body;
  const total = quantity * price;
  const date = new Date().toISOString().split('T')[0];
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // 1. Create OrderList
    db.run(`INSERT INTO OrderList (buyer_id, baddr_id, order_date, order_status, order_totalamount) VALUES (?, ?, ?, 'Confirmed', ?)`, 
      [buyer_id, baddr_id, date, total], function(err) {
        if (err) { db.run('ROLLBACK'); return res.status(400).json({ error: err.message }); }
        const order_id = this.lastID;
        
        // 2. Create OrderItem
        db.run(`INSERT INTO OrderItem (order_id, listg_id, ordit_quantity, ordit_itemprice) VALUES (?, ?, ?, ?)`,
          [order_id, listg_id, quantity, price], function(err) {
            if (err) { db.run('ROLLBACK'); return res.status(400).json({ error: err.message }); }
            
            // 3. Create Payment
            db.run(`INSERT INTO Payment (order_id, paymt_method, paymt_amount, paymt_date, paymt_status) VALUES (?, ?, ?, ?, 'Completed')`,
              [order_id, payment_method, total, date], function(err) {
                if (err) { db.run('ROLLBACK'); return res.status(400).json({ error: err.message }); }
                
                // 4. Update Listing Quantity
                db.run(`UPDATE Listing SET listg_quantity = listg_quantity - ? WHERE listg_id = ?`, [quantity, listg_id], function(err) {
                  if (err) { db.run('ROLLBACK'); return res.status(400).json({ error: err.message }); }
                  db.run('COMMIT');
                  res.json({ message: 'Order created successfully', order_id });
                });
            });
        });
    });
  });
});

// Get Buyer Orders
app.get('/api/orders/buyer/:id', (req, res) => {
  const sql = `
    SELECT o.*, oi.listg_id, oi.ordit_quantity, l.listg_title, p.prdct_brand,
           s.shpmt_trackingno, s.shpmt_status
    FROM OrderList o
    JOIN OrderItem oi ON o.order_id = oi.order_id
    JOIN Listing l ON oi.listg_id = l.listg_id
    JOIN Product p ON l.prdct_id = p.prdct_id
    LEFT JOIN Shipment s ON o.order_id = s.order_id
    WHERE o.buyer_id = ?
  `;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// Get Seller Orders
app.get('/api/orders/seller/:sellr_id', (req, res) => {
  const sql = `
    SELECT o.*, oi.listg_id, oi.ordit_quantity, l.listg_title, 
           b.buyer_fname, b.buyer_lname, s.shpmt_id
    FROM OrderList o
    JOIN OrderItem oi ON o.order_id = oi.order_id
    JOIN Listing l ON oi.listg_id = l.listg_id
    JOIN Buyer b ON o.buyer_id = b.buyer_id
    LEFT JOIN Shipment s ON o.order_id = s.order_id
    WHERE l.sellr_id = ?
  `;
  db.all(sql, [req.params.sellr_id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// --- Shipping & Couriers ---

app.get('/api/couriers', (req, res) => {
  db.all(`SELECT * FROM Courier`, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

app.post('/api/shipments', (req, res) => {
  const { order_id, courr_id, trackingno, expectdate } = req.body;
  const shipdate = new Date().toISOString().split('T')[0];
  const sql = `INSERT INTO Shipment (order_id, courr_id, shpmt_trackingno, shpmt_shipdate, shpmt_expectdate, shpmt_status) VALUES (?, ?, ?, ?, ?, 'In Transit')`;
  
  db.run(sql, [order_id, courr_id, trackingno, shipdate, expectdate], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    db.run(`UPDATE OrderList SET order_status = 'Shipped' WHERE order_id = ?`, [order_id]);
    res.json({ message: 'Shipment created', id: this.lastID });
  });
});

// --- Products & Inventory ---

// Add Product Profile
app.post('/api/products', (req, res) => {
  const { sellr_id, name, brand, condition, desc } = req.body;
  const sql = `INSERT INTO Product (sellr_id, prdct_name, prdct_brand, prdct_cond, prdct_desc) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [sellr_id, name, brand, condition, desc], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Product profile created', id: this.lastID });
  });
});

// Get Products for Seller
app.get('/api/products/seller/:sellr_id', (req, res) => {
  db.all(`SELECT * FROM Product WHERE sellr_id = ?`, [req.params.sellr_id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// Create Listing
app.post('/api/listings', (req, res) => {
  const { prdct_id, sellr_id, ctgry_id, title, format, startprice, fixedprice, bestoffer, status, quantity, startdate, enddate } = req.body;
  const sql = `INSERT INTO Listing (prdct_id, sellr_id, ctgry_id, listg_title, listg_format, listg_startprice, listg_fixedprice, listg_bestoffer, listg_status, listg_quantity, listg_startdate, listg_enddate) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [prdct_id, sellr_id, ctgry_id, title, format, startprice, fixedprice, bestoffer, status, quantity, startdate, enddate], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Listing created', id: this.lastID });
  });
});

// Get Categories
app.get('/api/categories', (req, res) => {
  db.all(`SELECT * FROM Category`, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// --- Feedback ---
app.post('/api/feedback', (req, res) => {
  const { listg_id, buyer_id, sellr_id, comment, type } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const sql = `INSERT INTO Feedback (listg_id, buyer_id, sellr_id, fdbck_comment, fdbck_type, fdbck_date) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [listg_id, buyer_id, sellr_id, comment, type, date], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Feedback submitted', id: this.lastID });
  });
});

// --- Other API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'eBay Philippines API is running' });
});

// Get all listings
app.get('/api/listings', (req, res) => {
  const sql = `
    SELECT l.*, p.prdct_name, p.prdct_brand, s.sellr_fname, s.sellr_lname
    FROM Listing l
    JOIN Product p ON l.prdct_id = p.prdct_id
    JOIN Seller s ON l.sellr_id = s.sellr_id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
