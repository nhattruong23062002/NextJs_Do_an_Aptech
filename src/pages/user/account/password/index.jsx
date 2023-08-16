import React, { useState,useEffect } from 'react'
import { ImArrowLeft2 } from "react-icons/im";
import Link from 'next/link';

import HeadMeta from '@/components/HeadMeta'
import MenuComponent from '@/components/Menu'
import Footer from '@/layout/Footer'
import Header from '@/layout/Header'
import styles from './Password.module.css'
import { getTokenFromLocalStorage } from '@/utils/tokenUtils'
import axiosClient from '@/libraries/axiosClient'



const Password = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Call it once on the client side
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'currentPassword') {
      setCurrentPassword(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit= async (e) => {
    e.preventDefault();
    const token = getTokenFromLocalStorage();
    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu mới không khớp. Vui lòng thử lại.");
      return;
    }

    try {
      const response = await axiosClient.post(`/user/customers/changePassword/${token}`, { newPassword,currentPassword });
      console.log("Response from Backend:", response.data);
      alert("Mật khẩu đã được đặt lại thành công.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error resetting password:", error.response);
      alert("Đã có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.");
    }
    

  };

  return (
    <div>
      <HeadMeta title="Change Password" />
      <Header />
      <main className={styles.main}>
        <div style={{ display: 'flex' }} className="container">
          <div className={styles.wrapperSidebar}>
            <img
              src="https://wallpapers.com/images/featured/background-design-background-6tgpche84avnjqvz.jpg"
              alt=""
            />
            <MenuComponent />
          </div>
          <div className={styles.wrapperContent}>
            {isMobile ? (
              <>
              <div>
             <Link href="/"><ImArrowLeft2 className={styles.icon}/></Link>
              <h2 className={styles.h2}>Đổi mật khẩu</h2>
           </div>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>
                      <input
                        placeholder='Nhập mật khẩu cũ...'
                        type="password"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        placeholder='Nhập mật khẩu mới...'
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        placeholder='Xác nhận mật khẩu mới...'
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              </>
            ):(
            <>
            <h2 className={styles.h2}>Đổi mật khẩu</h2>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>Mật khẩu cũ:</td>
                  <td>
                    <input
                      type="password"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Mật khẩu mới:</td>
                  <td>
                    <input
                      type="password"
                      name="newPassword"
                      value={newPassword}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Xác nhận mật khẩu: </td>
                  <td>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            </>
            )}
            <button className={styles.button} onClick={handleSubmit}>
              Xác nhận
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Password;
