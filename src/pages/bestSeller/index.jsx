import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";

import axiosClient from "@/libraries/axiosClient";
import Herder from "@/layout/Header";
import Footer from "@/layout/Footer";
import ProductItem from "@/components/ProductItem";
import HeadMeta from "@/components/HeadMeta";
import { getTokenFromLocalStorage } from "../../utils/tokenUtils";
import useCartStore from "@/stores/cartStore";


const BestSeller = ({ bestseller }) => {
  const [customerId, setCustomerId] = useState(null);
  const { addToCart, fetchCartData1 } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    // Lấy token từ localStorage
    const token = getTokenFromLocalStorage();

    if (token) {
      try {
        // Giải mã token để lấy thông tin customerId
        const decodedToken = jwt_decode(token);
        const { _id: customerId } = decodedToken;
        setCustomerId(customerId);
        fetchCartData1(customerId);
      } catch (error) {
        console.error("Error decoding token:", error);
        setCustomerId(null);
      }
    }
  }, []);

  const handleAddToCart = async (_id, stock) => { // Thêm tham số stock vào hàm
    const token = getTokenFromLocalStorage();
    const productId = _id;
    if (stock < 1) { // Kiểm tra nếu stock nhỏ hơn 1
      alert("Sản phẩm không còn trong kho. Vui lòng chọn sản phẩm khác.");
      return; // Dừng thực hiện hàm nếu stock nhỏ hơn 1
    }
    if (token) {
      try {
        const response = await axiosClient.post(
          `/user/cart`,
          {
            customerId,
            productId,
            quantity: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        addToCart(productId);
        fetchCartData1(customerId)
      } catch (error) {
        console.error("Error checking login:", error);
      }
    } else {
      // Nếu không có token, chuyển hướng đến trang đăng nhập
      router.push("/login");
    }
  };
  
  return (
    <>
      <HeadMeta title="Best Seller" />
      <Herder />
      <section style={{ paddingBottom: "50px" }} id="sellers">
        <div className="seller container">
          <span className="abc">
            <h2 className="hh4">Best Seller</h2>
          </span>
          {bestseller.length > 0 ? (
            <div className="best-seller">
              {bestseller.map((p) => (
                <Link key={p._id} href={`/products/${p._id}`}>
                  <ProductItem
                    _id={p._id}
                    photo={p.photo}
                    name={p.name}
                    price={p.price}
                    discountedPrice={p.discountedPrice}
                    handleAddToCart={() => handleAddToCart(p._id, p.stock)} 
                  />
                </Link>
              ))}
            </div>
          ) : (
            <small>Không có sản phẩm</small>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BestSeller;

export async function getServerSideProps() {
  try {
    const response = await axiosClient.get("/questions/bestseller");

    return {
      props: {
        bestseller: response.data.payload,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
