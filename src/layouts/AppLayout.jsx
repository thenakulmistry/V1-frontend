// src/layouts/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User as UserIconLucide, LogOut, ShoppingCart, X, Plus, Minus } from 'lucide-react'; // Renamed and added icons
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Notification from '@/components/common/Notification';
import bgImage from '@/assets/bg9.jpg';
import apiClient from '@/services/apiClient'; // Import apiClient

export default function AppLayout() {
  const { user, logout, token } = useAuth(); // Added token
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [requiredByDateTime, setRequiredByDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Helper to normalize MongoDB ObjectId (can be moved to a utils file)
  const normalizeId = (id) => {
    if (id === null || id === undefined) return String(id);
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.$oid && typeof id.$oid === 'string') return id.$oid;
    return String(id);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (item) => {
    const itemId = normalizeId(item.id); // Ensure item.id is a string
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => normalizeId(cartItem.id) === itemId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          normalizeId(cartItem.id) === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, id: itemId, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    const targetId = normalizeId(itemId);
    setCart(prevCart => prevCart.filter(item => normalizeId(item.id) !== targetId));
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    const targetId = normalizeId(itemId);
    if (newQuantity <= 0) {
      removeFromCart(targetId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        normalizeId(item.id) === targetId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setNotification({ show: true, message: 'Your cart is empty!', type: 'error' });
      return;
    }
    if (numberOfPeople < 1) {
      setNotification({ show: true, message: 'Number of people must be at least 1.', type: 'error' });
      return;
    }
    if (!requiredByDateTime) {
      setNotification({ show: true, message: 'Please specify when you need the order by.', type: 'error' });
      return;
    }
    const selectedDate = new Date(requiredByDateTime);
    if (selectedDate <= new Date()) {
      setNotification({ show: true, message: 'Please select a future date and time.', type: 'error' });
      return;
    }

    try {
      const orderDTO = {
        items: cart.map(item => ({
          itemId: String(normalizeId(item.id)), // Ensure string ID
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: parseFloat(getTotalPrice()),
        people: parseInt(numberOfPeople, 10),
        requiredByDateTime: requiredByDateTime,
        notes: notes
      };

      // Use apiClient to make the request, which correctly constructs the URL and adds headers.
      await apiClient.post('/user/add_order', orderDTO);

      setNotification({ show: true, message: 'Order placed successfully! You will receive a call on your registered number shortly to confirm the details.', type: 'success' });
      setCart([]);
      setNumberOfPeople(1);
      setRequiredByDateTime('');
      setNotes('');
      setIsCartOpen(false); // Close cart after order
    } catch (error) {
      console.error('Error placing order:', error);
      setNotification({ show: true, message: 'Failed to place order: ' + (error.response?.data?.message || error.message), type: 'error' });
    }
  };


  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Floating Navbar */}
      <nav
        className="fixed top-6 left-1/2 z-50 -translate-x-1/2
        flex items-center
        px-4 py-2
        rounded-full
        bg-white/30
        backdrop-blur-xl
        shadow-2xl
        border border-white/40
        max-w-md w-[340px] justify-between"
        style={{ minHeight: '56px' }}
      >
        <div className="flex items-center gap-2">
          <Link to="/user/dashboard">
            <img src="/logo3.png" alt="Gauri Cooks Logo" className="h-10" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleCart} className="relative p-2 rounded-full text-stone-800 hover:bg-white/30">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {cart.length}
              </span>
            )}
          </button>
          <Link to="/user/profile" className="flex items-center">
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/60 transition-colors cursor-pointer">
              <UserIconLucide size={22} className="text-stone-700" />
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-stone-600 hover:text-stone-800 hover:bg-stone-500/20"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind navbar */}
      <div className="h-[80px]"></div>

      {/* Page Content */}
      <main className="flex-grow">
        {/* This Outlet is crucial for rendering nested routes like ProfilePage and DashboardPage */}
        <Outlet context={{ addToCart, cart }} /> {/* Pass addToCart and cart to children */}
      </main>

      {/* Cart Modal/Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 transition-colors duration-200">
          <div
            className="
              bg-white/30
              backdrop-blur-xl
              border border-white/40
              shadow-2xl
              rounded-3xl
              max-w-md w-full
              mx-4
              p-6
              flex flex-col
              relative
              animate-fade-in
            "
            style={{ minHeight: '480px', maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-stone-800">Your Cart</h2>
              <button onClick={toggleCart} className="p-2 rounded-md text-stone-600 hover:bg-white/30 absolute top-4 right-4">
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <ShoppingCart size={48} className="text-stone-400 mb-4" />
                <p className="text-stone-500 text-lg">Your cart is empty.</p>
                <p className="text-stone-400 mt-2">Add items from the dashboard to get started!</p>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={normalizeId(item.id)} className="flex items-center justify-between py-3 border-b border-stone-300/50 last:border-b-0">
                      <div className="flex-1 mr-2">
                        <h5 className="font-medium text-md text-stone-800">{item.name}</h5>
                        <p className="text-sm text-stone-600">₹{item.price?.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-stone-200/60 rounded flex items-center justify-center text-sm text-stone-800 hover:bg-stone-300/60"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-md font-medium w-6 text-center text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-stone-200/60 rounded flex items-center justify-center text-sm text-stone-800 hover:bg-stone-300/60"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 bg-red-200/50 text-red-600 rounded flex items-center justify-center text-sm hover:bg-red-300/50 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-300/50 pt-6 mt-6">
                  <div className="mb-4">
                    <label htmlFor="numberOfPeople" className="block text-sm font-medium text-stone-600 mb-1">
                      Number of People:
                    </label>
                    <div className="flex items-center justify-between w-full px-2 py-[5px] border bg-white/50 border-stone-300 rounded-md shadow-sm">
                      <span className="text-md font-medium text-stone-800">{numberOfPeople}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNumberOfPeople(p => Math.max(1, p - 1))}
                          className="w-7 h-7 bg-stone-200/60 rounded flex items-center justify-center text-sm text-stone-800 hover:bg-stone-300/60"
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNumberOfPeople(p => p + 1)}
                          className="w-7 h-7 bg-stone-200/60 rounded flex items-center justify-center text-sm text-stone-800 hover:bg-stone-300/60"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="requiredByDateTime" className="block text-sm font-medium text-stone-600 mb-1">
                      Required By (Date and Time):
                    </label>
                    <input
                      type="datetime-local"
                      id="requiredByDateTime"
                      name="requiredByDateTime"
                      value={requiredByDateTime}
                      onChange={(e) => setRequiredByDateTime(e.target.value)}
                      className="w-full p-2 border bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500 rounded-md shadow-sm sm:text-sm"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-stone-600 mb-1">
                      Special Instructions:
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 border bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500 rounded-md shadow-sm sm:text-sm"
                      placeholder="Any special instructions"
                    ></textarea>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold text-stone-800">Total:</span>
                    <span className="text-xl font-bold text-stone-800">₹{getTotalPrice()}</span>
                  </div>
                  <p className="text-xs text-stone-600 text-center mb-4 italic">
                    *The final price and items are subject to change. You will receive a confirmation call on your registered number to finalize your order.
                  </p>
                  <Button onClick={placeOrder} className="w-full text-lg py-3 bg-stone-800 hover:bg-stone-900 text-white">
                    Place Order
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
}