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


const FlashSale = ({ flashsale }) => {
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

const handleAddToCart = async (_id, stock) => {
  // Thêm tham số stock vào hàm
  const token = getTokenFromLocalStorage();
  const productId = _id;
  if (stock < 1) {
    // Kiểm tra nếu stock nhỏ hơn 1
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
      <HeadMeta title="Flash Sale" />
      <Herder />
      <section style={{ paddingBottom: "50px" }} id="sellers">
        <div className="seller container">
          <span className="abc">
            <h2 className="hh4">Flash Sale</h2>
          </span>
          {flashsale.length > 0 ? (
            
            <div className="best-seller ">
              {flashsale.map((p) => (
                <Link key={p._id} href={`/products/${p._id}`}>
                  <ProductItem
                    key={p._id}
                    _id={p._id}
                    photo={p.photo}
                    name={p.name}
                    price={p.price}
                    discountedPrice={p.discountedPrice}
                    handleAddToCart={() => handleAddToCart(p._id, p.stock)}
                    discount={
                      <div className="home-product-item__sale-off">
                        <span className="home-product-item__sale-off-percent">
                          {p.discount}%
                        </span>
                        <span className="home-product-item__sale-off-label">
                          GIẢM
                        </span>
                      </div>
                    }
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

export default FlashSale;

export async function getServerSideProps() {
  try {
    const response = await axiosClient.get("/questions/flashsale");

    return {
      props: {
        flashsale: response.data.payload,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
