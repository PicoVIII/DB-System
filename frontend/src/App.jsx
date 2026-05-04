import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Bell, LogOut } from 'lucide-react';
import Auth from './Auth';

function App() {
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      fetch('http://localhost:3000/api/listings')
        .then(res => res.json())
        .then(data => {
          if (data.message === 'success') {
            setListings(data.data);
          }
        })
        .catch(err => console.error('Error fetching listings:', err));
    }
  }, [user]);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tighter">
            <ShoppingCart className="w-8 h-8" />
            eBay PH
          </div>
          
          <div className="flex-1 max-w-2xl hidden md:flex relative">
            <input 
              type="text" 
              placeholder="Search for anything..." 
              className="w-full px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex flex-col items-center gap-0.5">
              <div className="text-[10px] font-bold uppercase text-blue-600">{user.role}</div>
              <div className="text-xs font-semibold">{user.buyer_fname || user.sellr_fname}</div>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="hover:text-red-600 transition-colors flex flex-col items-center gap-1 text-xs"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
            <button className="hover:text-blue-600 transition-colors flex flex-col items-center gap-1 text-xs relative">
              <Bell className="w-5 h-5" />
              Alerts
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <button className="hover:text-blue-600 transition-colors flex flex-col items-center gap-1 text-xs">
              <ShoppingCart className="w-5 h-5" />
              Cart
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Listings</h1>
          <p className="text-gray-500">Discover top deals and rare finds</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.listg_id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Image Placeholder
                </div>
                {listing.listg_format === 'Auction' && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                    Auction
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col h-[180px]">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">{listing.prdct_brand}</div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {listing.listg_title}
                </h3>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${(listing.listg_fixedprice || listing.listg_startprice).toFixed(2)}
                    </div>
                    {listing.listg_format === 'Auction' && <div className="text-xs text-gray-500 mt-1">Current Bid</div>}
                  </div>
                  <button className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
