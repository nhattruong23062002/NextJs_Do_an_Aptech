import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import jwt_decode from "jwt-decode";
import ReactPaginate from "react-paginate";

import ProductItem from "../ProductItem";
import axiosClient from "@/libraries/axiosClient";
import styles from "./ProductList.module.css";
import { getTokenFromLocalStorage } from "../../utils/tokenUtils";
import useCartStore from "@/stores/cartStore";

const ProductList = (props) => {
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const { addToCart, fetchCartData1 } = useCartStore();
  const router = useRouter();

  const limit = 8;
  const pageCount = total / limit;

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get(
        `/questions/productlist?skip=${skip}&limit=${limit}`
      );
      setProducts(res.data.payload);
      setTotal(res.data.total);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [skip]);

  const handlePageChange = (selectedPage) => {
    const newSkip = selectedPage.selected * limit;
    setSkip(newSkip);
  };

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
    <div style={{ paddingBottom: "50px", paddingTop: "80px" }}>
      <section id="sellers">
        <div className="seller container">
          <div>
            <h4 className={styles.h3}>Product List</h4>
          </div>
          {products?.length > 0 ? (
            <div
              className="best-seller"
            >
              {products.map((p) => (
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
            <small>Không còn sản phẩm</small>
          )}
        </div>
      </section>
      <ReactPaginate
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageChange}
        handleNextPage={false}
        containerClassName="pagination"
        activeClassName="active"
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        breakClassName={"break"}
        pageClassName={"page"}
        previousClassName={"previous"}
        nextClassName={"next"}
        disabledClassName={"disabled"}
      />
    </div>
  );
};
export default ProductList;
