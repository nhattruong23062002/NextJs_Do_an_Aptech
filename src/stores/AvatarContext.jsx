// avatarStore.js
import axiosClient from '@/libraries/axiosClient';
import { getTokenFromLocalStorage } from '@/utils/tokenUtils';
import create from 'zustand';
const useAvatarStore = create((set) => ({
  avatar: null,
  setAvatar: (newAvatar) => set({ avatar: newAvatar }),

  getAvatarData: async () => {
    try {
      const token = getTokenFromLocalStorage();
      const response = await axiosClient.get('/user/customers/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const profileData = response.data.payload.avatarUrl;
      console.log('««««« get oke »»»»»');
      set({ avatar: profileData }); // Sử dụng set để cập nhật avatar trong store
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  },
}));


export default useAvatarStore;
