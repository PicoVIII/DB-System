"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Auth from "./components/Auth";
import SellerDashboard from "./components/SellerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import ListingAction from "./components/ListingAction";
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('marketplace'); // marketplace, dashboard
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    // Fetch listings when on marketplace
    if (currentTab === 'marketplace') {
      fetch('http://localhost:3000/api/listings')
        .then(res => res.json())
        .then(data => {
          if (data.message === 'success' || data.data) {
            setListings(data.data || []);
          }
        })
        .catch(err => console.error('Error fetching listings:', err));
    }
  }, [currentTab, selectedListing]); // Re-fetch if we come back from a listing or switch tabs

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        user={user} 
        setUser={setUser} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        setSelectedListing={setSelectedListing} 
      />

      {currentTab === 'marketplace' && !selectedListing && (
        <div className="bg-white border-b border-gray-200">
            <div className="px-45 py-3 flex justify-between text-xs text-gray-600 font-medium overflow-x-auto gap-8 no-scrollbar">
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">eBay Live</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Saved</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Motors</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Electronics</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Collectibles</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Home and Garden</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Clothing & Accessories</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Toys</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Sporting Goods</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Business & Industrial</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Jewelry & Watches</Link>
                <Link href='#' className="hover:text-blue-600 whitespace-nowrap">Refurbished</Link>
            </div>
        </div>
      )}

      <main className="flex-1 w-full pb-12">
        {currentTab === 'dashboard' ? (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            {user.role === 'seller' ? (
              <SellerDashboard user={user} />
            ) : (
              <BuyerDashboard user={user} />
            )}
          </div>
        ) : selectedListing ? (
          <div className="max-w-7xl mx-auto px-4">
            <ListingAction 
              listing={selectedListing} 
              user={user} 
              onBack={() => setSelectedListing(null)} 
            />
          </div>
        ) : (
          <>
            <div className="mt-6">
              <Hero />
            </div>
            
            <div className="px-45 mt-10">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Explore Popular Categories</h2>
                  <p className="text-gray-500">Find the best deals on eBay Philippines</p>
                </div>
                <Link href="#" className="text-sm font-bold text-blue-600 hover:underline">See all &rarr;</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
                    <p className="text-gray-400">No active listings found at the moment.</p>
                  </div>
                ) : (
                  listings.map((listing) => (
                    <div 
                      key={listing.listg_id} 
                      onClick={() => setSelectedListing(listing)}
                      className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer flex flex-col"
                    >
                      <div className="h-56 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        <div className="text-gray-300 font-medium">Image Placeholder</div>
                        {listing.listg_format === 'Auction' && (
                          <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full shadow-lg z-10">
                            Auction
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="text-[10px] text-blue-600 mb-1 font-black uppercase tracking-widest">{listing.prdct_brand || 'Featured'}</div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                          {listing.listg_title}
                        </h3>
                        <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                          <div>
                            <div className="text-2xl font-black text-gray-900">
                              ${(listing.listg_fixedprice || listing.listg_startprice).toFixed(2)}
                            </div>
                            {listing.listg_format === 'Auction' && <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Starting Bid</div>}
                          </div>
                          <button className="bg-gray-50 text-blue-600 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 pt-12 pb-8 px-45">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Buy</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:underline">Registration</Link></li>
              <li><Link href="#" className="hover:underline">eBay Money Back Guarantee</Link></li>
              <li><Link href="#" className="hover:underline">Bidding & buying help</Link></li>
              <li><Link href="#" className="hover:underline">Stores</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Sell</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:underline">Start selling</Link></li>
              <li><Link href="#" className="hover:underline">Learn to sell</Link></li>
              <li><Link href="#" className="hover:underline">Affiliates</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">About eBay</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:underline">Company info</Link></li>
              <li><Link href="#" className="hover:underline">News</Link></li>
              <li><Link href="#" className="hover:underline">Investors</Link></li>
              <li><Link href="#" className="hover:underline">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Help & Contact</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="#" className="hover:underline">Seller Center</Link></li>
              <li><Link href="#" className="hover:underline">Contact Us</Link></li>
              <li><Link href="#" className="hover:underline">eBay Returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 text-xs text-gray-400">
          Copyright © 1995-2026 eBay Inc. All Rights Reserved. Accessibility, User Agreement, Privacy, Consumer Health Data, Payments Terms of Use, Cookies, CA Privacy Notice, Your Privacy Choices.
        </div>
      </footer>
    </div>
  );
}
