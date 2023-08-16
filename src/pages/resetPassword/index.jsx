// Trang "pages/reset-password/[token].jsx"
import React, { useState } from "react";
import { useRouter } from "next/router";
import axiosClient from "@/libraries/axiosClient";
import styles from "./ResetPassword.module.css"

const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query; // Lấy token từ URL


  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  console.log('««««« token »»»»»', token);
  console.log('««««« password »»»»»', password);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const response = await axiosClient.post(`/user/customers/resetPassword/${token}`, { password });
      console.log("Response from Backend:", response.data);
      alert("Mật khẩu đã được đặt lại thành công.");
      router.push("/login");
    } catch (error) {
      console.error("Error resetting password:", error.response.data);
      alert("Đã có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2>Đặt lại mật khẩu</h2>
        <form onSubmit={handleResetPassword}>
          <div className={styles.formGroup}>
            <label htmlFor="password">Mật khẩu mới:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
