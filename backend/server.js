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
    db.run(sql, [fname, lname, phone, email, password], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Buyer registered', id: this.lastID });
    });
  } else if (type === 'seller') {
    const sql = `INSERT INTO Seller (sellr_fname, sellr_lname, sellr_phone, sellr_email, sellr_password) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [fname, lname, phone, email, password], function(err) {
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
