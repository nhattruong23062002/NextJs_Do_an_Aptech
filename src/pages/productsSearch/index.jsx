import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import jwt_decode from "jwt-decode";

import useCartStore from "@/stores/cartStore";
import HeadMeta from "@/components/HeadMeta";
import { getTokenFromLocalStorage } from "../../utils/tokenUtils";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import ProductItem from "@/components/ProductItem";
import axiosClient from "@/libraries/axiosClient";

const ProductsSearch = () => {
  const router = useRouter();
  const { searchTerm } = router.query;
  const [searchResults, setSearchResults] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const { addToCart, fetchCartData1 } = useCartStore();

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

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axiosClient.get(
          `/questions/productSearch?name=${searchTerm}`
        );
        const searchResults = response.data.payload;
        setSearchResults(searchResults);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };

    if (searchTerm) {
      fetchSearchResults();
    }
  }, [searchTerm]);

  return (
    <>
      <div>
        <HeadMeta title="Sản phẩm tìm kiếm" />
        <Header />
        <section
          style={{ paddingBottom: "50px", minHeight: "500px" }}
          id="sellers"
        >
          <div className="seller container search-Page">
            {searchResults.length > 0 ? (
              <>
                <span className="abc">
                  <h3 style={{ marginTop: "20px" }} className="hh4">
                    Sản phẩm tìm kiếm
                  </h3>
                </span>
                <div className="best-seller">
                  {searchResults.map((p) => (
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
              </>
            ) : (
              <small>Không có sản phẩm nào</small>
            )}
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default ProductsSearch;
