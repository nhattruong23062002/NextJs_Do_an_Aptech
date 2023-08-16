import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb, Slider, Switch, Checkbox, Select } from "antd";
import { useRouter } from "next/router";
import queryString from "query-string";
import jwt_decode from "jwt-decode";

import axiosClient from "../../libraries/axiosClient.js";
import HeadMeta from "@/components/HeadMeta/index.jsx";
import Header from "@/layout/Header/index.jsx";
import Footer from "@/layout/Footer/index.jsx";
import ProductItem from "@/components/ProductItem/index.jsx";
import styles from "./ProductCaregory.module.css";
import { getTokenFromLocalStorage } from "../../utils/tokenUtils";
import useCartStore from "@/stores/cartStore";


const ProductCategory = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inputValue, setInputValue] = useState(200000);
  const [cate, setCate] = useState([]);
  const [sortBy, setSortBy] = useState(null);
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
  

  //check danh mục đã chọn khi click từ homepage vào
  useEffect(() => {
    const selectedCategoryId = router.query.categoryIds;
    if (selectedCategoryId) {
      setSelectedCategories([selectedCategoryId]);
    }
  }, [router.query.id]);

  //get products filter
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedCategories.length === 0) {
          setProducts([]); // Nếu không có danh mục nào được chọn, không hiển thị sản phẩm
          return;
        }
        const categoryIdsParam = selectedCategories.join(",");

        const queryParams = {
          categoryIds: categoryIdsParam,
          minPrice: 50000,
          maxPrice: inputValue,
          sortBy,
        };

        const searchString = queryString.stringify(queryParams);
        const response = await axiosClient.get(
          `questions/filterCategory?${searchString}`
        );

        // Tổng hợp sản phẩm của các danh mục được chọn
        const allProducts = response.data.payload.reduce(
          (acc, category) => acc.concat(category),
          []
        );

        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, [selectedCategories, inputValue, sortBy]);

  //get all category
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axiosClient.get(`/user/categories`);
        setCate(response.data.payload);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };
    fetchSearchResults();
  }, []);

  // xử lý khi checkbox
  const handleCategoryChange = (categoryId, checked) => {
    if (checked) {
      setSelectedCategories((prevSelected) => [...prevSelected, categoryId]);
    } else {
      setSelectedCategories((prevSelected) =>
        prevSelected.filter((id) => id !== categoryId)
      );
    }
  };

  /*PHẦN XỬ LÝ THAY ĐỔI QUERY TƯƠNG ỨNG VÀO URL*/

  // Xử lý khi checkbox danh mục thay đổi
  const handleCategoryCheckboxChange = (categoryId, checked) => {
    handleCategoryChange(categoryId, checked);

    // Thay đổi URL với các câu query tương ứng
    const queryParams = {
      categoryIds: checked
        ? [...selectedCategories, categoryId]
        : selectedCategories.filter((id) => id !== categoryId),
      minPrice: 50000,
      maxPrice: inputValue,
    };
    const searchString = queryString.stringify(queryParams);
    router.replace(`?${searchString}`);
  };

  // Xử lý khi giá trị slider (thanh lọc giá) thay đổi
  const handleSliderChange = (newValue) => {
    setInputValue(newValue);

    // Thay đổi URL với các câu query tương ứng
    const queryParams = {
      categoryIds: selectedCategories,
      minPrice: 50000,
      maxPrice: newValue,
    };
    const searchString = queryString.stringify(queryParams);
    router.replace(`?${searchString}`);
  };

  //Xử lý sắp xếp theo discount
  const handleSortByDiscount = () => {
    setSortBy("discountHighToLow");

    // Thay đổi URL với các câu query tương ứng
    const queryParams = {
      categoryIds: selectedCategories,
      minPrice: 50000,
      maxPrice: inputValue,
      sortBy: "discountHighToLow",
    };
    const searchString = queryString.stringify(queryParams);
    router.replace(`?${searchString}`);
  };

  //Xử lý sắp xếp theo sản phẩm bán chạy
  const handleSortByBestSeller = () => {
    setSortBy("bestSelling");

    // Thay đổi URL với các câu query tương ứng
    const queryParams = {
      categoryIds: selectedCategories,
      minPrice: 50000,
      maxPrice: inputValue,
      sortBy: "bestSelling",
    };
    const searchString = queryString.stringify(queryParams);
    router.replace(`?${searchString}`);
  };

  //xử lý sắp xếp theo sản phẩm mới nhất
  const handleSortByNewest = () => {
    setSortBy("newest");

    // Thay đổi URL với các câu query tương ứng
    const queryParams = {
      categoryIds: selectedCategories,
      minPrice: 50000,
      maxPrice: inputValue,
      sortBy: "newest",
    };
    const searchString = queryString.stringify(queryParams);
    router.replace(`?${searchString}`);
  };

  //xử lý sắp xếp theo giá
  const handleSortByChange = (value) => {
    let newSortBy = null;
    if (value === "1") {
      newSortBy = "priceLowToHigh";
    } else if (value === "2") {
      newSortBy = "priceHighToLow";
    }

    setSortBy(newSortBy);

    // Thay đổi URL với các câu query tương ứng
    const queryParams = {
      categoryIds: selectedCategories,
      minPrice: 50000,
      maxPrice: inputValue,
      sortBy: newSortBy,
    };
    const searchString = queryString.stringify(queryParams);
    router.replace(`?${searchString}`);
  };

  return (
    <>
      <HeadMeta title="Fillter Products" />
      <Header />
      <Breadcrumb
        style={{ marginTop: "12px", fontSize: "16px" }}
        className="container"
        items={[
          {
            title: <Link href={`/`}>HomePage</Link>,
          },
          {
            title: "Danh mục",
          },
        ]}
      />
      <div className={`${styles.main} container`}>
        <div className={styles.wrapperFilter}>
          <div className={styles.filterCate}>
            <h3 className={styles.h3}>CATEGORIES</h3>
            {cate.map((c) => (
              <div key={c._id}>
                <Checkbox
                  checked={selectedCategories.includes(c._id)}
                  onChange={(e) =>
                    handleCategoryCheckboxChange(c._id, e.target.checked)
                  }
                >
                  {c.name}
                </Checkbox>
              </div>
            ))}
          </div>
          <div className={styles.filterPrice}>
            <h3>FILTER BY PRICE</h3>
            <div>
              <Slider
                max={500000}
                min={50000}
                defaultValue={200000}
                step={10000}
                onChange={handleSliderChange}
                value={typeof inputValue === "number" ? inputValue : 0}
              />
            </div>
            <p>50000đ - {inputValue}đ</p>
          </div>
        </div>
        <section
          style={{ paddingBottom: "50px" }}
          className={styles.wrapperProducts}
        >
          <div className="home-filter hide-on-mobile-tablet">
            <span className="home-filter__label">Sắp xếp theo</span>
            <button className="home-filter__btn btn" onClick={handleSortByDiscount}>
              Giảm giá
            </button>
            <button className="home-filter__btn btn " onClick={handleSortByNewest}>Mới nhất</button>
            <button className="home-filter__btn btn" onClick={handleSortByBestSeller}>
              Bán chạy
            </button>
            <Select
              className="filter-price"
              showSearch
              placeholder="Giá"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").includes(input)
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              options={[
                {
                  value: "1",
                  label: "Giá từ thấp đến cao",
                },
                {
                  value: "2",
                  label: "Giá từ cao đến thấp",
                },
              ]}
              onChange={handleSortByChange} // Thêm hàm xử lý sự kiện onChange
            />

            <div className="home-filter__page">
              <span className="home-filter__page-num">
                <span className="home-filter__page-current">1</span>/14
              </span>
              <div className="home-filter__page-control">
                <a
                  href=""
                  className="home-filter__page-btn home-filter__page-btn--disable"
                >
                  <i className="home-filter__page-icon fas fa-angle-left"></i>
                </a>
                <a href="" className="home-filter__page-btn">
                  <i className="home-filter__page-icon fas fa-angle-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="seller">
            {products.length > 0 ? (
              <div className="best-seller">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    href={`/products/${p._id}`}
                  >
                    <ProductItem
                      key={p._id}
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
      </div>
      <Footer />
    </>
  );
};

export default ProductCategory;
