import React, { useState, useEffect } from 'react';
import { Package, Plus, Layout, List, Tag, CheckCircle, ShoppingBag, Truck } from 'lucide-react';

function SellerDashboard({ user }) {
  const [view, setView] = useState('inventory'); // inventory, add-product, create-listing, orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([{id: 1, name: 'Electronics'}, {id: 2, name: 'Fashion'}, {id: 3, name: 'Home'}]);
  
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', condition: 'New', desc: '' });
  const [newListing, setNewListing] = useState({
    prdct_id: '',
    ctgry_id: '1',
    title: '',
    format: 'Fixed Price',
    startprice: 0,
    fixedprice: 0,
    bestoffer: 'No',
    quantity: 1,
    startdate: new Date().toISOString().split('T')[0],
    enddate: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/products/seller/${user.sellr_id}`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/orders/seller/${user.sellr_id}`);
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    if (view === 'inventory') fetchProducts();
    if (view === 'orders') fetchOrders();
  }, [view]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, sellr_id: user.sellr_id })
      });
      if (res.ok) {
        alert('Product created!');
        fetchProducts();
        setView('inventory');
      }
    } catch (err) {
      alert('Error creating product');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newListing, 
          sellr_id: user.sellr_id,
          status: 'Active',
          startprice: parseFloat(newListing.startprice),
          fixedprice: parseFloat(newListing.fixedprice),
          quantity: parseInt(newListing.quantity)
        })
      });
      if (res.ok) {
        alert('Listing published!');
        setView('inventory');
      }
    } catch (err) {
      alert('Error creating listing');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="lg:w-64 space-y-2">
        <button 
          onClick={() => setView('inventory')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Layout className="w-5 h-5" />
          <span className="font-semibold">Inventory</span>
        </button>
        <button 
          onClick={() => setView('add-product')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'add-product' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Product</span>
        </button>
        <button 
          onClick={() => setView('orders')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-semibold">Incoming Orders</span>
        </button>
      </aside>

      {/* Content Area */}
      <main className="flex-1">
        {view === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Incoming Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.order_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                        Order #{order.order_id} • {order.buyer_fname} {order.buyer_lname}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{order.listg_title}</h4>
                      <p className="text-sm text-gray-500">Total: ${order.order_totalamount} • Status: {order.order_status}</p>
                    </div>
                    {!order.shpmt_id && (
                      <button 
                        onClick={async () => {
                          const tracking = prompt('Enter tracking number:');
                          if (!tracking) return;
                          await fetch('http://localhost:3000/api/shipments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              order_id: order.order_id,
                              courr_id: 1,
                              trackingno: tracking,
                              expectdate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]
                            })
                          });
                          fetchOrders();
                        }}
                        className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        Mark Shipped
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {view === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Inventory</h2>
              <div className="text-sm text-gray-500 font-medium">{products.length} Products Found</div>
            </div>
            
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No products yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first product to the database.</p>
                <button 
                  onClick={() => setView('add-product')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Create First Product
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map(p => (
                  <div key={p.prdct_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div>
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{p.prdct_brand || 'No Brand'}</div>
                      <h4 className="text-lg font-bold text-gray-900">{p.prdct_name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{p.prdct_desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setNewListing({...newListing, prdct_id: p.prdct_id, title: p.prdct_name});
                        setView('create-listing');
                      }}
                      className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      List for Sale
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'add-product' && (
          <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product Profile</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
                  <input 
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Brand</label>
                  <input 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newProduct.brand}
                    onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Condition</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                  value={newProduct.condition}
                  onChange={e => setNewProduct({...newProduct, condition: e.target.value})}
                >
                  <option>New</option>
                  <option>Used</option>
                  <option>Refurbished</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm h-32"
                  value={newProduct.desc}
                  onChange={e => setNewProduct({...newProduct, desc: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4">
                <CheckCircle className="w-5 h-5" />
                Save Product
              </button>
            </form>
          </div>
        )}

        {view === 'create-listing' && (
          <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Public Listing</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Listing Title</label>
                <input 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  value={newListing.title}
                  onChange={e => setNewListing({...newListing, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newListing.ctgry_id}
                    onChange={e => setNewListing({...newListing, ctgry_id: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Format</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newListing.format}
                    onChange={e => setNewListing({...newListing, format: e.target.value})}
                  >
                    <option>Fixed Price</option>
                    <option>Auction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Price ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newListing.format === 'Auction' ? newListing.startprice : newListing.fixedprice}
                    onChange={e => setNewListing({
                      ...newListing, 
                      [newListing.format === 'Auction' ? 'startprice' : 'fixedprice']: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Quantity</label>
                  <input 
                    type="number"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newListing.quantity}
                    onChange={e => setNewListing({...newListing, quantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">End Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newListing.enddate}
                    onChange={e => setNewListing({...newListing, enddate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Allow Best Offers?</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={newListing.bestoffer}
                    onChange={e => setNewListing({...newListing, bestoffer: e.target.value})}
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4">
                <Tag className="w-5 h-5" />
                Publish Listing
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerDashboard;
