import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { TbLock } from "react-icons/tb";
import axiosClient from "@/libraries/axiosClient";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  console.log('««««« email »»»»»', email);

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post("/user/customers/forgotPassword", { email });
      // Hiển thị thông báo cho người dùng nếu email đã được gửi thành công
      alert(response.data.message );
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Error sending email:", error.response.data.message );
      alert(error.response.data.message);
    }
  };
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <span className={styles.icon}><TbLock/></span>
        <h2 className={styles.h2}>Quên mật khẩu</h2>
        <p>Nhập địa chỉ email của bạn để lấy lại mật khẩu.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Vui lòng nhập Email"
              className={styles.inputField}
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <button className={styles.submitButton} type="submit">
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
