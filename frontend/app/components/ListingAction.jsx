"use client";
import React, { useState } from 'react';
import { DollarSign, ShoppingCart, Tag, CheckCircle } from 'lucide-react';

function ListingAction({ listing, user, onBack }) {
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: For a real app, we'd fetch/select a BuyerAddress. We use ID 1 for MVP.
  const handleBuyNow = async () => {
    if (!user || user.role !== 'buyer') return alert('Please login as a buyer to purchase.');
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user.buyer_id,
          baddr_id: 1, // Mock address ID
          listg_id: listing.listg_id,
          quantity: 1,
          price: listing.listg_fixedprice,
          payment_method: 'Credit Card'
        })
      });
      if (res.ok) {
        alert('Purchase successful!');
        onBack();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'buyer') return alert('Please login as a buyer to bid.');
    
    const amount = parseFloat(bidAmount);
    if (amount <= listing.listg_startprice) return alert('Bid must be higher than current price.');
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listg_id: listing.listg_id,
          buyer_id: user.buyer_id,
          amount
        })
      });
      if (res.ok) {
        alert('Bid placed successfully!');
        onBack();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'buyer') return alert('Please login as a buyer to make an offer.');
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listg_id: listing.listg_id,
          buyer_id: user.buyer_id,
          amount: parseFloat(offerAmount)
        })
      });
      if (res.ok) {
        alert('Offer submitted to seller!');
        onBack();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-3xl mx-auto mt-8">
      <button onClick={onBack} className="text-blue-600 font-bold mb-6 hover:underline">
        &larr; Back to Listings
      </button>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
          Product Image
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">{listing.prdct_brand}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.listg_title}</h1>
          <p className="text-gray-500 mb-6">Seller ID: {listing.sellr_id}</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="text-sm text-gray-500 font-semibold mb-1">
              {listing.listg_format === 'Auction' ? 'Current Bid' : 'Buy It Now Price'}
            </div>
            <div className="text-4xl font-bold text-gray-900">
              ${(listing.listg_fixedprice || listing.listg_startprice).toFixed(2)}
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {listing.listg_format === 'Fixed Price' && (
              <button 
                onClick={handleBuyNow} 
                disabled={loading}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy It Now
              </button>
            )}

            {listing.listg_format === 'Auction' && (
              <form onSubmit={handlePlaceBid} className="flex gap-2">
                <input 
                  type="number" 
                  step="0.01" 
                  required
                  placeholder={`Min $${(listing.listg_startprice + 1).toFixed(2)}`}
                  className="flex-1 p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Place Bid
                </button>
              </form>
            )}

            {listing.listg_bestoffer === 'Yes' && (
              <form onSubmit={handleMakeOffer} className="flex gap-2">
                <input 
                  type="number" 
                  step="0.01" 
                  required
                  placeholder="Your Offer"
                  className="flex-1 p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gray-800 text-white px-8 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Make Offer
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingAction;
