import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Helper to get correct key
  const getCartKey = (currentUser) => {
    if (currentUser && currentUser.id) {
      return `cart_${currentUser.id}`;
    }
    return "cart_guest"; // Use distinct key for guest to avoid pollution
  };

  // Function to load cart
  const loadCart = (currentUser) => {
    const key = getCartKey(currentUser);
    const stored = localStorage.getItem(key);
    try {
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error("Failed to parse cart", e);
      setCartItems([]);
    }
  };

  // Initialize and listen for User changes
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
      loadCart(parsedUser);
    };

    checkUser();

    // Listen for storage events (e.g. login/logout in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        checkUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-tab login/logout
    window.addEventListener("auth-change", checkUser);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", checkUser);
    };
  }, []);

  // Sync cart to local storage whenever it changes
  // We need to be careful not to overwrite if we haven't loaded yet? 
  // Better approach: Just save when we modify. 
  // However, `cartItems` state is the source of truth for the UI.

  const saveCart = (items, currentUser = user) => {
    const key = getCartKey(currentUser);
    localStorage.setItem(key, JSON.stringify(items));
    setCartItems(items);
    // Dispatch event to update other components if they still use localStorage directly (temporary)
    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = (product) => {
    const currentCart = [...cartItems];
    
    const existingItemIndex = product.isBundle 
      ? -1 
      : currentCart.findIndex((item) => item._id === product._id || item.id === product.id);

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        ...product,
        id: product._id || product.id,
        quantity: 1,
      });
    }
    saveCart(currentCart);
    alert(product.isBundle ? "Đã thêm Bundle vào giỏ hàng!" : "Đã thêm sản phẩm vào giỏ hàng!");
  };

  const removeFromCart = (productId) => {
    const newCart = cartItems.filter((item) => (item.id || item._id) !== productId);
    saveCart(newCart);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    const newCart = cartItems.map((item) => 
      (item.id || item._id) === productId ? { ...item, quantity: newQty } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Refresh cart (call this when login happens if not auto-detected)
  const refreshCart = () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
    loadCart(parsedUser);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      refreshCart,
      cartCount: cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};
