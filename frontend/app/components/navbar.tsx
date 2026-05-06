"use client";
import Link from 'next/link'
import Image from 'next/image';
import eBayLogo from '../icons/eBayLogo.png'
import { ChevronDown, ShoppingCart, Bell, User } from "lucide-react";

export default function Navbar({ user, setUser, currentTab, setCurrentTab, setSelectedListing }) {
    return (
    <nav className="bg-white">
        <div className="border-b border-gray-200 px-45 py-2 flex items-center justify-between text-xs">
            <div className='flex items-center gap-6'>
                {user ? (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Hi {user.buyer_fname || user.sellr_fname}!</span>
                        <button onClick={() => setUser(null)} className="text-blue-600 hover:underline">Sign out</button>
                    </div>
                ) : (
                    <p>Hi! <Link href='#' className='text-blue-700 underline'>Sign In</Link> or <Link href="#" className='text-blue-700 underline'>Register</Link></p>
                )}
                <Link href='#' className="hover:text-blue-600">Daily Deals</Link>
                <Link href='#' className="hover:text-blue-600">Brand Outlet</Link>
                <Link href='#' className="hover:text-blue-600">Help & Contact</Link>
            </div>
            <div className='flex items-center gap-10 text-gray-600'>
                <button 
                  onClick={() => setCurrentTab('dashboard')}
                  className={`hover:text-blue-600 ${currentTab === 'dashboard' ? 'text-blue-600 font-bold' : ''}`}
                >
                  My eBay
                </button>
                <Link href='#' className='flex items-center gap-1 hover:text-blue-600'>Watchlist <ChevronDown className="w-3 h-3" /></Link>
                <button 
                  onClick={() => setCurrentTab('marketplace')}
                  className={`hover:text-blue-600 ${currentTab === 'marketplace' ? 'text-blue-600 font-bold' : ''}`}
                >
                  Sell
                </button>
                <Link href='#'><Bell className='w-4.5 h-4.5 hover:text-blue-600'/></Link>
                <Link href='#'><ShoppingCart className='w-4.5 h-4.5 hover:text-blue-600'/></Link>
            </div>
        </div>
        <div className="border-b border-gray-200 px-45 py-4 flex items-center justify-between">
            <div onClick={() => { setCurrentTab('marketplace'); setSelectedListing(null); }} className="cursor-pointer">
                <Image
                    src={eBayLogo}
                    width={117}
                    height={48}
                    alt='eBay Logo'
                    priority
                />
            </div>
            <button className="px-4 flex items-center text-sm text-gray-600">
                <span className="leading-tight text-left">
                    Shop by<br />
                    <span className="flex items-center gap-1 font-bold text-gray-800">
                    category
                    <ChevronDown className="w-3 h-3" />
                    </span>
                </span>
            </button>
            <div className='flex flex-1 border rounded-full overflow-hidden mx-2 border-gray-300'>
                <div className="flex flex-1">
                    <input
                        type="text"
                        placeholder="Search for anything"
                        className="flex-1 px-4 py-2.5 outline-none text-sm"
                    />
                    <div className="border-l border-gray-200 px-4 py-2.5 flex items-center text-sm text-gray-600">
                        All Categories <ChevronDown className="ml-2 w-3 h-3" />
                    </div>
                </div>
            </div>

            <button className='rounded-full px-12 py-2.5 bg-blue-600 mx-2 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm'>Search</button>
            <Link href='#' className='text-gray-500 text-xs hover:underline'>Advanced</Link>
        </div>
    </nav>
  );
}
