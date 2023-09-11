import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axiosClient from "../../libraries/axiosClient.js";
import jwt_decode from "jwt-decode";
import {
  getTokenFromLocalStorage,
  removeTokenFromLocalStorage,
} from "../../utils/tokenUtils";

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPhoneAlt,
  FaBattleNet,
  FaHeart,
  FaUserAlt,
  FaShoppingCart,
} from "react-icons/fa";
import InputSearch from "@/components/InputSearch";
import useCartStore from "@/stores/cartStore.jsx";
import useAvatarStore from "@/stores/AvatarContext.jsx";
import { BsFillSearchHeartFill } from "react-icons/bs";
import Script from "next/script";

function Header({ handleSearch }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const { avatar, getAvatarData } = useAvatarStore();
  const [isSearchBarVisible, setSearchBarVisible] = useState(false);
  const [isMtoggleActive, setMtoggleActive] = useState(true);
  const cartItems = useCartStore((state) => state.cartItems);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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
    // Gọi hàm getProfileData khi Header được mount (chỉ gọi một lần)
    getAvatarData();
  }, []);

    
  const handleSearchIconClick = () => {
    setSearchBarVisible(!isSearchBarVisible);
  };

  const handleMtoggleClick = () => {
    setMtoggleActive(!isMtoggleActive);
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = getTokenFromLocalStorage();

      if (token) {
        try {
          const response = await axiosClient.get("/user/orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.payload) {
            setIsLoggedIn(true);
            setIsLoginSuccess(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error checking login:", error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoggedIn();
  }, []);

  const handleClickToCart = (event) => {
    event.preventDefault();
    if (isLoggedIn) {
      router.push("/cart");
    } else {
      router.push("/login"); // Chuyển hướng đến trang đăng nhập
    }
  };

  //xử lý đăng xuất
  const handleLogout = () => {
    if (isLoggedIn) {
      removeTokenFromLocalStorage();
      router.push("/");
    }
  };
  return (
    <header className={`${isSearchBarVisible ? 'paddingBottom' : ''}`}>
       <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"
        strategy="beforeInteractive"
      />
      <div className="container">
        <div className="header-top">
          <div className="header-top-left xs-hidden">
            FREE RETURNS. STANDARD SHIPPING ORDERS $99+
          </div>
          <div className="header-top-right  sm-flex-full">
            <div className="header-menu header-label d-flex">
              <a className=" md-hidden" href="#">My Account</a>
              <a className=" md-hidden" href="#">Contact Us</a>
              <a className=" md-hidden" href="#">Blog</a>
              <a className=" md-hidden" href="#">My Wishlist</a>
              <a className=" md-hidden" href="#">Cart</a>
              {isLoginSuccess ? ( // Kiểm tra trạng thái đăng nhập thành công và hiển thị avatar nếu thành công
                <li className="has-dropdown">
                  <img
                    className="avatar"
                    src={`https://do-an-aptech-nodejs.onrender.com/${avatar}`}
                    alt="Avatar"
                  />
                  <ul className="sub-menu">
                    <li>
                      <Link href="/user/account/profile">
                        Tài khoản của tôi
                      </Link>
                    </li>
                    <li>
                      <Link href="/user/purchase">Đơn mua</Link>
                    </li>
                    {isMobile ? (
                    <li>
                      <Link href="/user/account/password">Đổi mật khẩu</Link>
                    </li>
                    ):('')}
                    <li>
                      <a onClick={handleLogout} href="https://next-js-do-an-aptech-duphong.vercel.app/">
                        Đăng xuất
                      </a>
                    </li>
                  </ul>
                </li>
              ) : (
                <Link href="/login" className="login-link">
                  Log In
                </Link>
              )}
            </div>
            <div className="header-menu social-icons">
              <a href="#" className="social-facebook" target="_blank">
                <FaFacebook />
              </a>
              <a href="#" className="social-twitter" target="_blank">
                <FaTwitter />
              </a>
              <a href="#" className="social-instagram" target="_blank">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="header-middle">
          <div className="header-middle-flex d-flex">
            <Link href="/" className="navbar-brand">
              <FaBattleNet /> Elysian 
            </Link>

            <div className={`search-bar xs-hidden ${isSearchBarVisible ? 'visible' : ''}`}>
              <form className="search-form clearfix" action="" method="GET">
                <input
                  placeholder="Search keywords... "
                  type="text"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" aria-label="Search" title="Search">
                  <Link
                    href={`/productsSearch?searchTerm=${encodeURIComponent(
                      searchTerm
                    )}`}
                  >
                    <BsFillSearchHeartFill
                      style={{ fontSize: "24px", color: "#5a5a5a" }}
                    />
                  </Link>
                </button>
              </form>
            </div>

            <div className="header-contact d-flex sm-hidden">
              <div>
                <FaPhoneAlt />
              </div>
              <h6>
                CALL US NOW{" "}
                <a href="tel:#" className="font1">
                  +123 5678 890
                </a>
              </h6>
            </div>
            <div className="header-icon d-flex">
            <BsFillSearchHeartFill className="search-button" onClick={handleSearchIconClick} />
              <a href="#" aria-label="Login" title="Login">
                <div>
                  <FaUserAlt className="hidden_icon" />
                </div>
              </a>
              <a href="#" aria-label="Collect" title="Collect">
                <div>
                  <FaHeart className="hidden_icon" />
                </div>
              </a>
              <Link
                onClick={handleClickToCart}
                id="cart"
                href=""
                aria-label="Cart"
                title="Cart"
              >
                <em className="quantity_cart">{cartItems.length}</em>
                <div>
                  <FaShoppingCart className="icon_mobile" />
                </div>
              </Link>
              <div className="lg-hidden mtoggle" id="mtoggle" onClick={handleMtoggleClick}>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`header-bottom ${isMtoggleActive ? 'md-hidden': ''}`}>
        <nav className="container main-nav">
          <span className="lg-hidden mclose" id="mclose"  onClick={handleMtoggleClick}>x</span>
          <ul className="d-flex">
            <li className="current">
              <Link href="/">Home</Link>
            </li>
            <li className="has-child">
              <Link href="/filterProducts">Categories</Link>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="#">Blog</Link>
            </li>
            <li>
              <Link href="#">Contact Us</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
