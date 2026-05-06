"use client";
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, MessageSquare } from 'lucide-react';

function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/orders/buyer/${user.buyer_id}`);
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleLeaveFeedback = async (order) => {
    const comment = prompt('Leave feedback for this order:');
    if (!comment) return;
    
    try {
      // Note: we need the seller_id. For now, we mock it as 1 for the MVP
      const res = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listg_id: order.listg_id,
          buyer_id: user.buyer_id,
          sellr_id: 1, 
          comment: comment,
          type: 'Positive'
        })
      });
      if (res.ok) alert('Feedback submitted!');
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Purchases</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
          <p className="text-gray-500">Go to the marketplace to make your first purchase!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.order_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                    Order #{order.order_id} • {order.order_date}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{order.listg_title}</h4>
                  <p className="text-sm text-gray-500">Qty: {order.ordit_quantity} • Total: ${order.order_totalamount}</p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.order_status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                  order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {order.order_status}
                </div>
              </div>

              {order.shpmt_trackingno && (
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 text-sm mt-4">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-semibold text-gray-700">Tracking:</span> {order.shpmt_trackingno}
                    <span className="ml-2 text-gray-500">({order.shpmt_status})</span>
                  </div>
                </div>
              )}

              {order.order_status === 'Shipped' && (
                <div className="mt-4 flex justify-end">
                  <button onClick={() => handleLeaveFeedback(order)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Leave Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
