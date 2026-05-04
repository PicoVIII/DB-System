import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'ebay_ph.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Buyer
    db.run(`CREATE TABLE IF NOT EXISTS Buyer (
      buyer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_fname VARCHAR(50) NOT NULL,
      buyer_lname VARCHAR(50) NOT NULL,
      buyer_phone VARCHAR(20) NOT NULL,
      buyer_email VARCHAR(100) NOT NULL,
      buyer_password VARCHAR(255) NOT NULL
    )`);

    // 2. Seller
    db.run(`CREATE TABLE IF NOT EXISTS Seller (
      sellr_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sellr_fname VARCHAR(50) NOT NULL,
      sellr_lname VARCHAR(50) NOT NULL,
      sellr_phone VARCHAR(20) NOT NULL,
      sellr_email VARCHAR(100) NOT NULL,
      sellr_password VARCHAR(255) NOT NULL
    )`);

    // 3. BuyerAddress
    db.run(`CREATE TABLE IF NOT EXISTS BuyerAddress (
      baddr_id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      baddr_street VARCHAR(100) NOT NULL,
      baddr_city VARCHAR(50) NOT NULL,
      baddr_country VARCHAR(50) NOT NULL,
      baddr_pcode VARCHAR(20) NOT NULL,
      FOREIGN KEY (buyer_id) REFERENCES Buyer(buyer_id)
    )`);

    // 4. Category
    db.run(`CREATE TABLE IF NOT EXISTS Category (
      ctgry_id INTEGER PRIMARY KEY AUTOINCREMENT,
      ctgry_name VARCHAR(50) NOT NULL
    )`);

    // 5. Product
    db.run(`CREATE TABLE IF NOT EXISTS Product (
      prdct_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sellr_id INTEGER NOT NULL,
      prdct_name VARCHAR(100) NOT NULL,
      prdct_brand VARCHAR(50),
      prdct_cond VARCHAR(30) NOT NULL,
      prdct_desc TEXT,
      FOREIGN KEY (sellr_id) REFERENCES Seller(sellr_id)
    )`);

    // 6. Listing
    db.run(`CREATE TABLE IF NOT EXISTS Listing (
      listg_id INTEGER PRIMARY KEY AUTOINCREMENT,
      prdct_id INTEGER NOT NULL,
      sellr_id INTEGER NOT NULL,
      ctgry_id INTEGER NOT NULL,
      listg_title VARCHAR(150) NOT NULL,
      listg_format VARCHAR(20) NOT NULL,
      listg_startprice DECIMAL(10,2) NOT NULL,
      listg_fixedprice DECIMAL(10,2),
      listg_reserveprice DECIMAL(10,2),
      listg_bestoffer VARCHAR(3) NOT NULL,
      listg_status VARCHAR(20) NOT NULL,
      listg_quantity INTEGER NOT NULL,
      listg_startdate DATE NOT NULL,
      listg_enddate DATE NOT NULL,
      FOREIGN KEY (prdct_id) REFERENCES Product(prdct_id),
      FOREIGN KEY (sellr_id) REFERENCES Seller(sellr_id),
      FOREIGN KEY (ctgry_id) REFERENCES Category(ctgry_id)
    )`);

    // 7. Bid
    db.run(`CREATE TABLE IF NOT EXISTS Bid (
      bid_id INTEGER PRIMARY KEY AUTOINCREMENT,
      listg_id INTEGER NOT NULL,
      buyer_id INTEGER NOT NULL,
      bid_amount DECIMAL(10,2) NOT NULL,
      bid_date DATE NOT NULL,
      bid_status VARCHAR(20) NOT NULL,
      FOREIGN KEY (listg_id) REFERENCES Listing(listg_id),
      FOREIGN KEY (buyer_id) REFERENCES Buyer(buyer_id)
    )`);

    // 8. BestOffer
    db.run(`CREATE TABLE IF NOT EXISTS BestOffer (
      bstof_id INTEGER PRIMARY KEY AUTOINCREMENT,
      listg_id INTEGER NOT NULL,
      buyer_id INTEGER NOT NULL,
      bstof_amount DECIMAL(10,2) NOT NULL,
      bstof_date DATE NOT NULL,
      bstof_status VARCHAR(20) NOT NULL,
      FOREIGN KEY (listg_id) REFERENCES Listing(listg_id),
      FOREIGN KEY (buyer_id) REFERENCES Buyer(buyer_id)
    )`);

    // 9. OrderList
    db.run(`CREATE TABLE IF NOT EXISTS OrderList (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      baddr_id INTEGER NOT NULL,
      order_date DATE NOT NULL,
      order_status VARCHAR(20) NOT NULL,
      order_totalamount DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (buyer_id) REFERENCES Buyer(buyer_id),
      FOREIGN KEY (baddr_id) REFERENCES BuyerAddress(baddr_id)
    )`);

    // 10. OrderItem
    db.run(`CREATE TABLE IF NOT EXISTS OrderItem (
      order_id INTEGER NOT NULL,
      listg_id INTEGER NOT NULL,
      ordit_quantity INTEGER NOT NULL,
      ordit_itemprice DECIMAL(10,2) NOT NULL,
      PRIMARY KEY (order_id, listg_id),
      FOREIGN KEY (order_id) REFERENCES OrderList(order_id),
      FOREIGN KEY (listg_id) REFERENCES Listing(listg_id)
    )`);

    // 11. Payment
    db.run(`CREATE TABLE IF NOT EXISTS Payment (
      paymt_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      paymt_method VARCHAR(50) NOT NULL,
      paymt_amount DECIMAL(10,2) NOT NULL,
      paymt_date DATE NOT NULL,
      paymt_status VARCHAR(20) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES OrderList(order_id)
    )`);

    // 12. Courier
    db.run(`CREATE TABLE IF NOT EXISTS Courier (
      courr_id INTEGER PRIMARY KEY AUTOINCREMENT,
      courr_name VARCHAR(50) NOT NULL,
      courr_phone VARCHAR(20) NOT NULL,
      courr_email VARCHAR(100) NOT NULL
    )`);

    // 13. Shipment
    db.run(`CREATE TABLE IF NOT EXISTS Shipment (
      shpmt_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      courr_id INTEGER NOT NULL,
      shpmt_trackingno VARCHAR(50) NOT NULL,
      shpmt_shipdate DATE NOT NULL,
      shpmt_expectdate DATE NOT NULL,
      shpmt_deliverydate DATE,
      shpmt_status VARCHAR(20) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES OrderList(order_id),
      FOREIGN KEY (courr_id) REFERENCES Courier(courr_id)
    )`);

    // 14. Feedback
    db.run(`CREATE TABLE IF NOT EXISTS Feedback (
      fdbck_id INTEGER PRIMARY KEY AUTOINCREMENT,
      listg_id INTEGER NOT NULL,
      buyer_id INTEGER NOT NULL,
      sellr_id INTEGER NOT NULL,
      fdbck_comment TEXT NOT NULL,
      fdbck_type VARCHAR(20) NOT NULL,
      fdbck_date DATE NOT NULL,
      FOREIGN KEY (listg_id) REFERENCES Listing(listg_id),
      FOREIGN KEY (buyer_id) REFERENCES Buyer(buyer_id),
      FOREIGN KEY (sellr_id) REFERENCES Seller(sellr_id)
    )`);
    
    console.log('Database tables initialized.');
    
    // Seed some initial data for testing if Category is empty
    db.get("SELECT COUNT(*) as count FROM Category", (err, row) => {
      if (row.count === 0) {
        db.run("INSERT INTO Category (ctgry_name) VALUES ('Electronics'), ('Fashion'), ('Home & Garden')");
        db.run("INSERT INTO Seller (sellr_fname, sellr_lname, sellr_phone, sellr_email, sellr_password) VALUES ('John', 'Doe', '1234567890', 'john@example.com', 'password')");
        db.run("INSERT INTO Product (sellr_id, prdct_name, prdct_brand, prdct_cond, prdct_desc) VALUES (1, 'Vintage Leather Jacket', 'Levis', 'Used', 'Great condition')");
        db.run("INSERT INTO Listing (prdct_id, sellr_id, ctgry_id, listg_title, listg_format, listg_startprice, listg_fixedprice, listg_bestoffer, listg_status, listg_quantity, listg_startdate, listg_enddate) VALUES (1, 1, 2, 'Vintage Leather Jacket', 'Auction', 45.00, NULL, 'No', 'Active', 1, '2026-05-01', '2026-05-10')");
        db.run("INSERT INTO Product (sellr_id, prdct_name, prdct_brand, prdct_cond, prdct_desc) VALUES (1, 'Sony Alpha a7 III', 'Sony', 'New', 'Brand new in box')");
        db.run("INSERT INTO Listing (prdct_id, sellr_id, ctgry_id, listg_title, listg_format, listg_startprice, listg_fixedprice, listg_bestoffer, listg_status, listg_quantity, listg_startdate, listg_enddate) VALUES (2, 1, 1, 'Sony Alpha a7 III Mirrorless Camera', 'Fixed Price', 1800.00, 1800.00, 'Yes', 'Active', 5, '2026-05-01', '2026-05-30')");
        db.run("INSERT INTO Courier (courr_name, courr_phone, courr_email) VALUES ('J&T Express', '09123456789', 'support@jtexpress.ph'), ('LBC Express', '09198765432', 'customercare@lbcexpress.com')");
      }
    });
  });
}

export default db;
