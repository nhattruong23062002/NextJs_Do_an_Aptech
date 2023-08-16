import axiosClient from '@/libraries/axiosClient';
import { getTokenFromLocalStorage } from '@/utils/tokenUtils';
import create from 'zustand';

const useCartStore = create((set) => ({
  cartItems: [],
  addToCart: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  },

  fetchCartData1: async (customerId) => {
    const token = getTokenFromLocalStorage();
    try {
      // Gọi API để lấy dữ liệu giỏ hàng
      const response = await axiosClient.get(`/user/cart/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('««««« response »»»»»',  response.data.payload.products);
      set({ cartItems: response.data.payload.products });
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  },
}));

export default useCartStore;
