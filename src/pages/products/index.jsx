import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Breadcrumb } from "antd";
import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";

import axiosClient from "@/libraries/axiosClient";
import HeadMeta from "@/components/HeadMeta";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import ProductItem from "@/components/ProductItem";
import styles from "./ProductDetail.module.css";
import { getTokenFromLocalStorage } from "../../utils/tokenUtils";
import useCartStore from "@/stores/cartStore";



const Products = ({ products }) => {
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
      <HeadMeta title="All Products" />
      <Header />
      <Breadcrumb
      style={{marginTop:"12px",fontSize:"18px"}}
      className="container"
        items={[
          {
            title: <Link href={`/`}>HomePage</Link> ,
          },
          {
            title: "Products"
          }
        ]}
      />
      <section style={{ paddingBottom: "100px" }} id="sellers">
        <div className="seller container">
          <span className="abc">
            <h3 className={styles.h3}>All Products</h3>
          </span>
          {products.length > 0 ? (
            <div className="best-seller">
              {products.map((p) => (
                <Link key={p._id} href={`/products/${p._id}`}>
                  <ProductItem
                    _id = {p._id}
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

export default Products;

// getServerSideProps - Server-Side Rendering
export async function getServerSideProps() {
  try {
    const response = await axiosClient.get("/user/products");

    return {
      props: {
        products: response.data.payload,
      },

      // revalidate: 24 * 60 * 60,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

// getStaticProps - Static-Side Generation
// export async function getStaticPaths() {
//   return {
//     paths: [],
//     fallback: true,
//   };
// }

// export async function getStaticProps(req) {
//   try {
//     const response = await axiosClient.get('/products');

//     return {
//       props: {
//         products: response.data.payload,
//       },

//       // revalidate: 10,
//     };
//   } catch (error) {
//     return {
//       notFound: true,
//     };
//   }
// }
