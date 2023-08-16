

export const getTokenFromLocalStorage =  () => {
    // Lấy token từ localStorage
    const token =  localStorage.getItem("token");
    return token;
  };
  

export const setTokenToLocalStorage = (token) => {
    // Lưu token vào localStorage
    localStorage.setItem("token", token);
  };
  

export const removeTokenFromLocalStorage = () => {
    localStorage.removeItem("token"); // Xóa token từ localStorage
  };