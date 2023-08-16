import { useState,useEffect } from "react";
import React from "react";
import jwt_decode from "jwt-decode";
import Link from "next/link";
import { useRouter } from "next/router";

import HeadMeta from "@/components/HeadMeta";
import Footer from "@/layout/Footer";
import Header from "@/layout/Header";
import styles from "./Cart.module.css";
import { getTokenFromLocalStorage } from "../../utils/tokenUtils";
import axiosClient from "../../libraries/axiosClient.js";
import useCartStore from "@/stores/cartStore";


const Cart = () => {
  const [customerId, setCustomerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [checkedProducts, setCheckedProducts] = useState([]);
  const [couponCode, setCouponCode] = useState(""); // Thêm state để lưu mã giảm giá
  const router = useRouter();
  const { cartItems, fetchCartData1 } = useCartStore();

  
  const handleCouponCodeChange = (event) => {
    setCouponCode(event.target.value);
  };

  useEffect(() => {
    const token = getTokenFromLocalStorage();

    if (token) {
      try {
        // Giải mã token để lấy thông tin customerId
        const decodedToken = jwt_decode(token);
        const { _id : customerId } = decodedToken;
        setCustomerId(customerId);
        fetchCartData1(customerId);
        setProducts(cartItems);
      } catch (error) {
        console.error("Error decoding token:", error);
        setCustomerId(null);
      }
    }
  }, []);

  //xóa sản phẩm trong giỏ hàng
  const handleRemoveProduct = async (productId) => {
    const token = getTokenFromLocalStorage();
    if (token) {
      try {
        const response = await axiosClient.delete("/user/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            customerId,
            productId,
          },
        });
        fetchCartData1(customerId);

        
      } catch (error) {
        console.error("Error removing product:", error);
      }
    }
  };

  useEffect(() => {
    setProducts(cartItems);
  }, [cartItems]);


  const handleCheckboxChange = (productId) => {
    const isChecked = checkedProducts.includes(productId);
    if (isChecked) {
      // Nếu sản phẩm đã được chọn thì bỏ chọn (xóa khỏi mảng checkedProducts)
      setCheckedProducts(checkedProducts.filter((id) => id !== productId));
    } else {
      // Nếu sản phẩm chưa được chọn thì thêm vào mảng checkedProducts
      setCheckedProducts([...checkedProducts, productId]);
    }
  };
  
  //Tính tổng tiền sản phẩm sau khi áp dụng mã giảm giá
  const calculateTotalPrice1 = (products) => {
    let total = 0;
    products.forEach((product) => {
      if (checkedProducts.includes(product._id)) {
        // Nếu sản phẩm có trong mảng checkedProducts, tính tổng tiền
        total += product.productId.discountedPrice * product.quantity;
      }
    });

    if (couponCode === "GIAM20%") {
      const couponDiscount = 0.8; 
      total *= couponDiscount;
      return total;
    }else if(couponCode === "GIAM10%"){
      const couponDiscount = 0.9;
      total *= couponDiscount;
      return total;
    }
    return total;
  };

  //Tính tổng tiền sản phẩm trước khi áp dụng mã giảm giá
  const calculateTotalPrice2 = (products) => {
    let total = 0;
    products.forEach((product) => {
      if (checkedProducts.includes(product._id)) {
        // Nếu sản phẩm có trong mảng checkedProducts, tính tổng tiền
        total += product.productId.discountedPrice * product.quantity;
      }
    });
    return total;
  };


  const updateProductPrice = (productId, newQuantity) => {
    const updatedProducts = products.map((product) =>
      product._id === productId ? { ...product, quantity: newQuantity } : product
    );
    setProducts(updatedProducts);
  };
  

  // Gọi hàm updateProductPrice khi số lượng sản phẩm thay đổi
const handleIncreaseQuantity = async (productId, id) => {
  const token = getTokenFromLocalStorage();
  const selectedProduct = products.find((product) => product._id === productId);
  if (selectedProduct) {
    if (selectedProduct.quantity + 1 <= selectedProduct.productId.stock) {
      const newQuantity = selectedProduct.quantity + 1;
      updateProductPrice(productId, newQuantity);
      try {
        await axiosClient.post(
         `/user/cart`,
         {
           customerId,
           productId:id,
           quantity:1,
         },
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );
     } catch (error) {
       console.error("Error updating product stock:", error);
     }
    }
  }
};

const handleDecreaseQuantity = async (productId, id) => {
  const token = getTokenFromLocalStorage();
  const selectedProduct = products.find((product) => product._id === productId);
  if (selectedProduct) {
    if (selectedProduct.quantity > 1) {
      const newQuantity = Math.max(selectedProduct.quantity - 1, 1);
      updateProductPrice(productId, newQuantity);
      try {
         await axiosClient.post(
          `/user/cart`,
          {
            customerId,
            productId:id,
            quantity: -1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Error updating product stock:", error);
      }
    }
  }
};
  

  
  const handleBuyNow = () => {
    const selectedProductsQueryParam = JSON.stringify(
      checkedProducts.map((productId) => {
        const selectedProduct = products.find((product) => product._id === productId);
        if (selectedProduct) {
          const { quantity, productId: { _id, discountedPrice, name, photo, stock } } = selectedProduct;

          return {_id ,quantity, price: discountedPrice, name, photo, stock }; // Thêm thông tin ảnh và tên sản phẩm
        }
        return null;
      }).filter((product) => product !== null)
    );

    const totalPriceQueryParam = totalPrice1.toString();

    let discount = 0; 
    if (couponCode === "GIAM20%") {
      discount = 20;
    } else if (couponCode === "GIAM10%") {
      discount = 10;
    }
  
    if(checkedProducts.length > 0){
      router.push(`/checkout?products=${encodeURIComponent(selectedProductsQueryParam)}
      &totalPrice=${encodeURIComponent(totalPriceQueryParam)}
      &discount=${encodeURIComponent(discount)}
      `);
    }else{
      alert("Bạn cần chọn sản phẩm trước khi thanh toán")
    }

  };


  
  const totalPrice1 = calculateTotalPrice1(products);  
  const totalPrice2 = calculateTotalPrice2(products);  

  return (
    <>
      <HeadMeta title="Cart" />
      <Header />
      <div className={`${styles.card} container`}>
        <div className="row">
          <div className={`${styles.cart} col-md-8`}>
            <div className={styles.title}>
              <div className="row">
                <div className="col">
                  <h4>
                    <b className={styles.heading}>Shopping Cart</b>
                  </h4>
                </div>
                <div className="col align-self-center text-right text-muted">
                  {products.length} sản phẩm
                </div>
              </div>
            </div>

            {products.length > 0 ?(
                 <div className="border-top border-bottom">
                  {products.map((p) => (
                 <div key={p._id} className={`${styles.wrapProducts} border-top border-bottom`}>
                   <div className={styles.wrapImage}>
                     <input
                       className={styles.checkbox}
                       type="checkbox"
                       name=""
                       id=""
                       checked={checkedProducts.includes(p._id)}
                       onChange={() => handleCheckboxChange(p._id)}
                     />
                     <Link style={{display:"flex",textDecoration:"none"}} href={`/products/${p.productId._id}`} >
                     <img
                       className={styles.img}
                       src={p.productId.photo}
                       alt=""
                     />
                     <p className={styles.name}>{p.productId.name}</p>
                     </Link>
                   </div>
                   <div className={styles.wrapQuantityAndPrice}>
                   <div className={styles.quantity}>
                    <div onClick={() => handleIncreaseQuantity(p._id,p.productId._id)}>
                    <a className={styles.btnQuantity}>+</a>
                    </div>
                    <div>
                    <input className={styles.inputQuatity} type="text" value={p.quantity} readOnly/>
                    </div>
                    <div onClick={() => handleDecreaseQuantity(p._id,p.productId._id)}>
                    <a  className={styles.btnQuantity}>-</a>
                    </div>
                   </div>
                   <div className={styles.price}>
                     <strong>{p.productId.discountedPrice * p.quantity}đ</strong>
                   </div>
                   </div>
                   <span className={styles.delete}  onClick={() => handleRemoveProduct(p.productId._id)}>Xóa</span>
                 </div>
                ))}
               </div>
            ) : (
              <small>Giỏ hàng trống</small>
            )}
            <div className={styles.back}>
              <a href="#" className={styles.a}>
                ←
              </a>
              <Link href="/">Back to shop</Link>
            </div>
          </div>
          <div className={`${styles.summary} col-md-4 `}>
            <div>
              <h5 className={styles.h5}>
                <b>Summary</b>
              </h5>
            </div>
            <hr className={styles.hr} />
            <div className="row">
              <div className="col">{checkedProducts?(<p>{checkedProducts.length} sản phẩm</p> ):(<p>0 sản phẩm</p>)}</div>
              <div className="col text-right">{totalPrice2}đ</div>
            </div>
            <form className={styles.form}>
              <p>Nhân viên vận chuyển</p>
              <select className={styles.select}>
                <option className="text-muted">Nhân viên A</option>
                <option className="text-muted">Nhân viên B</option>
              </select>
              <p>Mã giảm giá</p>
              <input
                className={styles.input}
                id={styles.code}
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={handleCouponCodeChange}
              />
            </form>
            <div
              className="row"
              style={{
                borderTop: "1px solid rgba(0,0,0,.1)",
                padding: "2vh 0",
              }}
            >
              <div className="col">Tổng tiền</div>
              <strong className="col text-right">{totalPrice1}đ</strong>
            </div>
            <button onClick={handleBuyNow} className={styles.btn}>Mua Hàng</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
