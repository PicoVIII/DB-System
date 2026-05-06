"use client";
import React, { useState } from 'react';
import { ShoppingCart, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [type, setType] = useState('buyer');
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { type, email: formData.email, password: formData.password }
      : { type, ...formData };

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (isLogin) {
          onLogin(data.user);
        } else {
          setIsLogin(true);
          alert('Registration successful! Please login.');
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold">eBay Philippines</h1>
          <p className="text-blue-100 mt-2">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 mb-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all border-gray-200 peer-checked:border-blue-600 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input 
                  type="radio" 
                  name="type" 
                  value="buyer" 
                  checked={type === 'buyer'}
                  onChange={() => setType('buyer')}
                  className="hidden"
                />
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Buyer</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all border-gray-200 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input 
                  type="radio" 
                  name="type" 
                  value="seller" 
                  checked={type === 'seller'}
                  onChange={() => setType('seller')}
                  className="hidden"
                />
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Seller</span>
              </label>
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="First Name"
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={formData.fname}
                    onChange={(e) => setFormData({...formData, fname: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Last Name"
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                    value={formData.lname}
                    onChange={(e) => setFormData({...formData, lname: e.target.value})}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="tel" 
                  placeholder="Phone Number"
                  required
                  className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email Address"
                required
                className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="password" 
                placeholder="Password"
                required
                className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;
