import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
const dateFormat = 'YYYY-MM-DD';
import { ImArrowLeft2 } from "react-icons/im";
import Link from 'next/link';

import HeadMeta from '@/components/HeadMeta';
import MenuComponent from '@/components/Menu';
import Footer from '@/layout/Footer';
import Header from '@/layout/Header';
import styles from './Profile.module.css';
import axiosClient from '@/libraries/axiosClient';
import { getTokenFromLocalStorage } from '@/utils/tokenUtils';
import useAvatarStore from '@/stores/AvatarContext';


const Profile = () => {
  const [customerId, setCustomerId] = useState(null);
  const [tempAvatarFile, setTempAvatarFile] = useState(null);
  const { avatar, setAvatar } = useAvatarStore();
  const {getAvatarData} = useAvatarStore();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    avatarUrl:'',
    birthday: '',
  });
  const [newProfile, setNewProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    avatarUrl:'',
    birthday: null,
  });
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


  useEffect(() => {
    const token = getTokenFromLocalStorage();

    if (token) {
      try {
        // Giải mã token để lấy thông tin customerId
        const decodedToken = jwt_decode(token);
        const { _id : customerId } = decodedToken;
        setCustomerId(customerId);
      } catch (error) {
        console.error("Error decoding token:", error);
        setCustomerId(null);
      }
    }
  }, []);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = getTokenFromLocalStorage();
        const response = await axiosClient.get('/user/customers/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profileData = response.data.payload;
        // Cập nhật state với thông tin profile nhận được từ API
        setProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          avatarUrl:profileData.avatarUrl,
          birthday: profileData.birthday,
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    getProfileData();
  }, []);

  useEffect(() => {
    // Khi state profile thay đổi, cập nhật state newProfile
    setNewProfile(profile);
  }, [profile]);

  const formattedBirthday = newProfile.birthday ? dayjs(newProfile.birthday).format(dateFormat) : null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDatePickerChange = (date, dateString) => {
    setNewProfile((prevState) => ({
      ...prevState,
      birthday: date,
    }));
  };


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      // Lấy đường dẫn base64 của ảnh đã chọn
      const base64Image = reader.result;
      setTempAvatarFile(file);
      // Cập nhật lại src của thẻ img với ảnh mới
      const imgElement = document.getElementById("avatarImg");
      imgElement.src = base64Image;
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async () => {
    try {
      const token = getTokenFromLocalStorage();
      await axiosClient.patch(`/user/customers/${customerId}`, newProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Cập nhật thông tin profile sau khi thành công
      setProfile((prevState) => ({
        ...prevState,
        ...newProfile,
      }));
  
      // Nếu avatarUrl có giá trị (tức là đã chọn ảnh mới), gửi ảnh lên server
      if (tempAvatarFile) {
        const formData = new FormData();
        formData.append("file", tempAvatarFile); 
        axiosClient
          .post("/media/upload-single", formData, {
            headers: {
              "Content-Type": "multipart/form-data", 
              Authorization: `Bearer ${token}`,
            }    
          })
          .then((response) => {
            console.log("Upload success:", response.data);
          })
          .catch((error) => {
            console.error("Upload failed:", error);
          });
      } else {
        console.error("Cập nhật ảnh thất bại");
      }
      getAvatarData();
      alert("Bạn đã cập nhật thông tin thành công");
    } catch (error) {
      alert("Cập nhật thông tin thất bại");
      console.error("Error updating profile:", error);
    }
  };
  
  return (
    <>
      <HeadMeta title="Profile" />
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
               <div style={{display:"flex"}}>
               <Link href="/"><ImArrowLeft2 className={styles.icon}/></Link>
               <h1 className={styles.h2}>Hồ sơ của tôi</h1>
                </div>
            ):(
              <h1 className={styles.h2}>Hồ sơ của tôi</h1>
            )}
            <div className={styles.wrapperMid}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>FirstName</td>
                    <td>
                      <input
                        type="text"
                        name="firstName"
                        value={newProfile.firstName}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>LastName</td>
                    <td>
                      <input
                        type="text"
                        name="lastName"
                        value={newProfile.lastName}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>
                      <input
                        type="text"
                        name="email"
                        value={newProfile.email}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Số điện thoại</td>
                    <td>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={newProfile.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Ngày sinh</td>
                    <td>
                      <Space direction="vertical">
                        <DatePicker
                          onChange={handleDatePickerChange}
                          value={formattedBirthday ? dayjs(formattedBirthday, dateFormat) : null}
                          format={dateFormat}
                        />
                      </Space>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className={styles.wrapperUpload}>
                <img
                  id="avatarImg"
                  src={ `https://do-an-aptech-nodejs.onrender.com/${profile.avatarUrl}`}
                  alt="avatar"
                />
                <input
                  style={{fontSize:"12px"}}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
            <button className={styles.btnSave} onClick={handleSave}>
              Lưu
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Profile;
