import { useState,useEffect } from "react";
import { FaGoogle ,FaFacebook,FaGithub} from "react-icons/fa6";
import Link from "next/link";

import axiosClient from "../../libraries/axiosClient.js";
import { setTokenToLocalStorage } from "../../utils/tokenUtils";
import { useRouter } from "next/router";
import styles from "./login.module.css"


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();
  
  useEffect(() => {
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");
    const container = document.getElementById("container");

    // switch between login and signup
    signUpButton.addEventListener("click", () => {
      container.classList.add(styles.rightPanelActive);
    });

    signInButton.addEventListener("click", () => {
      container.classList.remove(styles.rightPanelActive);
    });

    // Clean up event listeners when component unmounts
    return () => {
      signUpButton.removeEventListener("click", () => {
        container.classList.add(styles.rightPanelActive);
      });

      signInButton.removeEventListener("click", () => {
        container.classList.remove(styles.rightPanelActive);
      });
    };
  }, []);


  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleSubmitLogin = (event) => {
    event.preventDefault();

    handleLogin();
  };

  const handleSubmitSignUp = (event) => {
    event.preventDefault();

    handleSignUp();
  };

  const handleLogin = async () => {
    try {
      const response = await axiosClient.post("/user/customers/login", {
        email,
        password,
      });

      // Kiểm tra phản hồi có chứa token hay không
      if (response.data.token) {
        // Lưu token vào localStorage 
        const token = response.data.token;
        setTokenToLocalStorage(token);

        // Chuyển hướng đến trang sau khi đăng nhập thành công
        router.push("/"); 
      } else {
        alert("Email hoặc mật khẩu không đúng");
      }
    } catch (error) {
      alert("Email hoặc mật khẩu không đúng");
      console.error("Error logging in:", error);
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axiosClient.post("/user/customers", {
        firstName,
        lastName,
        phoneNumber,
        email,
        address,
        password,
      });

      if (response.data.payload) {
        alert("Đăng ký thành công")
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
        setAddress("");
        setPassword("");
      } else {
        alert("Đăng ký không thành công");
      }
    } catch (errors) {
      alert("Đã có lỗi thông tin đăng ký", errors);
    }
  };
  
  

  return(
    <div className={styles.wrapper}>
    <div className={styles.container} id="container">
    
      <div className={`${styles.formWrap} ${styles.signUp}`}>
        <form className={styles.form} onSubmit={handleSubmitSignUp} action="#">
          <h1 className={styles.h1}>Create An Account</h1>
          
          <div className={styles.socialContainer}>
            <a href="#"><i className={styles.a}><FaFacebook/></i></a>
            <a href="#"><i className={styles.a}><FaGoogle/></i></a>
            <a href="#"><i className={styles.a}><FaGithub/></i></a>
          </div>
          <span className={styles.span}>use email for registration</span>
          <div style={{display:"flex",gap:"10px"}}>
          <input className={styles.input} value={firstName} onChange={handleFirstNameChange} type="text" placeholder="First Name" />
          <input className={styles.input} value={lastName} onChange={handleLastNameChange} type="text" placeholder="Last Name" />
          </div>
          <input className={styles.input} value={email} onChange={handleEmailChange}  type="email" placeholder="Email" />
          <input className={styles.input} value={phoneNumber} onChange={handlePhoneChange}  type="text" placeholder="PhoneNumber" />
          <input className={styles.input} value={address} onChange={handleAddressChange}  type="text" placeholder="Address" />
          <input className={styles.input} value={password} onChange={handlePasswordChange} type="password" placeholder="Password" />
          <button className={styles.button} type="submit" >Create Account</button>
          
        </form>
      </div>
     
      <div className={`${styles.formWrap} ${styles.signIn}`}>
        <form className={styles.form}  onSubmit={handleSubmitLogin} action="#">
          
          <h1  className={styles.h1}>Login In</h1>
          
          <div className={styles.socialContainer}>
            <a href="#"><i className={styles.a}><FaFacebook/></i></a>
            <a href="#"><i className={styles.a}><FaGoogle/></i></a>
            <a href="#"><i className={styles.a}><FaGithub/></i></a>
          </div>
          <span  className={styles.span}>Login In with your Account</span>
        
          <input className={styles.input} value={email} onChange={handleEmailChange}  type="email" placeholder="Email" />
          <input className={styles.input} value={password} onChange={handlePasswordChange} type="password" placeholder="Password" />
          <span  className={styles.span}>Forgot your <Link href="/forgotPassword" className={styles.forgot}>password?</Link></span>
          <button className={styles.button} type="submit">Login</button>
          
        </form>
      </div>
      
      <div className={styles.overlayContainer}>
        <div className={styles.overlay}>
          <div className={`${styles.overlayPannel} ${styles.overlayLeft}`}>
            <h1 className={styles.h1}>Already have an account</h1>
            <p className={styles.p}>Please Login</p>
            <button id="signIn" className={styles.button}>Sign In</button>
          </div>
          <div className={`${styles.overlayPannel} ${styles.overlayRight}`}>
            <h1 className={styles.h1}>Create Account</h1>
            <p className={styles.p}>Start Your Journey with Us</p>
            <button id="signUp" className={styles.button}>Sign Up</button>
          </div>
        </div>
      </div>

    </div>
  </div>
  )
};

export default LoginForm;
