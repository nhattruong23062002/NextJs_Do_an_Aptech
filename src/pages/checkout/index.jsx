import React from "react";
import jwt_decode from "jwt-decode";
import { PayPalButton } from "react-paypal-button-v2";
import { IoLocationSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { Button, Modal } from "antd";
import { useRouter } from "next/router";

import styles from "./Order.module.css";
import HeadMeta from "@/components/HeadMeta";
import axiosClient from "@/libraries/axiosClient";
import { getTokenFromLocalStorage } from "@/utils/tokenUtils";
import Footer from "@/layout/Footer";
import Header from "@/layout/Header";

const Checkout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [isPaymentShown, setIsPaymentShown] = useState(false);
  const [isPayPalActive, setIsPayPalActive] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const router = useRouter();


  const { products, totalPrice, discount } = router.query;

  const selectedProducts = products ? JSON.parse(products) : [];

  const totalPriceValue = totalPrice ? parseFloat(totalPrice) : 0;

  useEffect(() => {
    const token = getTokenFromLocalStorage();

    if (token) {
      try {
        // Giải mã token để lấy thông tin customerId
        const decodedToken = jwt_decode(token);
        const {
          _id: customerId,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          address: address,
        } = decodedToken;
        setCustomerId(customerId);
        setPhoneNumber(phoneNumber);
        setFullName(firstName + " " + lastName);
        setAddress(address);
      } catch (error) {
        console.error("Error decoding token:", error);
        setCustomerId(null);
      }
    }
  }, []);

  //Xử lý thông tin địa chỉ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get(
          "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
        );
        setCities(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    setSelectedDistrict("");
    setSelectedWard("");

    const selectedCityData = cities.find(
      (city) => city.Id === event.target.value
    );
    setDistricts(selectedCityData?.Districts || []);
  };

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
    setSelectedWard("");

    const selectedCityData = cities.find((city) => city.Id === selectedCity);
    const selectedDistrictData = selectedCityData?.Districts.find(
      (district) => district.Id === event.target.value
    );
    setWards(selectedDistrictData?.Wards || []);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setFullName(fullName);
    setPhoneNumber(phoneNumber);
    // Lấy tên của tỉnh/thành phố, quận/huyện và phường/xã từ state để tạo địa chỉ hoàn chỉnh
    const selectedCityData = cities.find((city) => city.Id === selectedCity);
    const selectedDistrictData = selectedCityData?.Districts.find(
      (district) => district.Id === selectedDistrict
    );
    const selectedWardData = selectedDistrictData?.Wards.find(
      (ward) => ward.Id === selectedWard
    );
    // Tạo địa chỉ hoàn chỉnh
    const completeAddress = `${selectedWardData?.Name || ""}, ${
      selectedDistrictData?.Name || ""
    }, ${selectedCityData?.Name || ""}, ${addressDetail || ""}`;
    // Cập nhật địa chỉ hoàn chỉnh vào state địa chỉ
    setAddress(completeAddress);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Xử lý khi nhấn nút "Thanh toán"
  const handlePayment = async () => {
    const token = getTokenFromLocalStorage();
    if (token) {
      try {
        const orderDetails = selectedProducts.map((product) => ({
          productId: product._id,
          quantity: product.quantity,
          price: product.price,
        }));
        const orderData = {
          createdDate: new Date().toISOString(), // Ngày tạo đơn hàng là ngày hiện tại
          paymentType: "CASH",
          status: "WAITING",
          shippingAddress: address,
          description:description,
          discount: discount,
          customerId: customerId,
          orderDetails: orderDetails,
          isDelete: false,
        };

        // Đưa headers vào trong object headers
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosClient.post("/user/orders", orderData, {
          headers,
        });

        console.log("Đơn hàng đã được tạo:", response.data);

        // Cập nhật stock sau khi thanh toán thành công
        for (const product of selectedProducts) {
          const newStock = product.stock - product.quantity;

          // Gửi yêu cầu cập nhật stock lên server
          await axiosClient.patch(`/user/products/${product._id}`, {
            stock: newStock,
          });

          // Nếu cần, bạn có thể thực hiện xử lý báo cáo, ghi log hoặc thông báo về việc cập nhật stock thành công
          console.log(
            `Đã cập nhật stock của sản phẩm ${product._id} thành công!`
          );
        }

        router.push("/checkoutSuccess");
      } catch (error) {
        alert("Lỗi!!!Tạo đơn hàng thất bại", error);
      }
    }
  };

  const onSuccessPaypal = async (details, data) => {
    const token = getTokenFromLocalStorage();
    if (token) {
      try {
        const orderDetails = selectedProducts.map((product) => ({
          productId: product._id,
          quantity: product.quantity,
          price: product.price,
        }));
        const orderData = {
          createdDate: new Date().toISOString(), // Ngày tạo đơn hàng là ngày hiện tại
          paymentType: "CREDIT CARD",
          status: "WAITING",
          shippingAddress: address,
          discount: discount,
          customerId: customerId,
          orderDetails: orderDetails,
          isDelete: false,
        };

        // Đưa headers vào trong object headers
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosClient.post("/user/orders", orderData, {
          headers,
        });

        console.log("Đơn hàng đã được tạo:", response.data);

        // Cập nhật stock sau khi thanh toán thành công
        for (const product of selectedProducts) {
          const newStock = product.stock - product.quantity;

          // Gửi yêu cầu cập nhật stock lên server
          await axiosClient.patch(`/user/products/${product._id}`, {
            stock: newStock,
          });

          // Nếu cần, bạn có thể thực hiện xử lý báo cáo, ghi log hoặc thông báo về việc cập nhật stock thành công
          console.log(
            `Đã cập nhật stock của sản phẩm ${product._id} thành công!`
          );
        }

        router.push("/checkoutSuccess");
      } catch (error) {
        alert("Lỗi!!!Tạo đơn hàng thất bại", error);
      }
    }
  };

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    const fetchData = async () => {
      try {
        const response = await axiosClient.get(
          "https://do-an-aptech-nodejs.onrender.com/user/orders/payment", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${response.data.data}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true)
      }
      document.body.appendChild(script);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if(!window.paypal){
      fetchData();
    }else{
      setSdkReady(true);
    }
  }, []);


  const handlePayPalClick = () => {
    setIsPayPalActive(true);
  };

  const handleCODClick = () => {
    setIsPayPalActive(false);
  };

  const handlePaymentToggle = () => {
    setIsPaymentShown(!isPaymentShown);
  };

  return (
    <div style={{ backgroundColor: " #f7f7f7" }}>
      <HeadMeta title="Checkout" />
      <Header />
      <main className={`${styles.body} container`}>
        <h1 className={styles.heading}>Thanh toán</h1>
        <div className={styles.wrapperAddress}>
          <div className={styles.addressTitle}>
            <h2 className={styles.title}>
              <IoLocationSharp />
              Địa chỉ nhận hàng
            </h2>
            <div>
              <p className={styles.p}>{fullName}</p>
              <p className={styles.p} style={{ marginTop: "-14px" }}>
                {phoneNumber}
              </p>
            </div>
          </div>
          <div className={styles.addressInfo}>
            <p>{address}</p>
            <p className={styles.p} onClick={showModal}>
              Thay đổi
            </p>
            <Modal
              title="Nhập địa chỉ giao hàng"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <div className={styles.inputInModal}>
                <input
                  type="text"
                  placeholder="Nhập họ tên"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </div>
              <div className={styles.selectLocation}>
                <select
                  className="form-select form-select-sm mb-3"
                  id="city"
                  aria-label=".form-select-sm"
                  value={selectedCity}
                  onChange={handleCityChange}
                >
                  <option value="">Chọn tỉnh thành</option>
                  {cities.map((city) => (
                    <option key={city.Id} value={city.Id}>
                      {city.Name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select form-select-sm mb-3"
                  id="district"
                  aria-label=".form-select-sm"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                >
                  <option value="">Chọn quận huyện</option>
                  {districts.map((district) => (
                    <option key={district.Id} value={district.Id}>
                      {district.Name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select form-select-sm"
                  id="ward"
                  aria-label=".form-select-sm"
                  value={selectedWard}
                  onChange={(event) => setSelectedWard(event.target.value)}
                >
                  <option value="">Chọn phường xã</option>
                  {wards.map((ward) => (
                    <option key={ward.Id} value={ward.Id}>
                      {ward.Name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className={styles.locationDetail}
                type="text"
                placeholder="Địa chỉ cụ thể"
                value={addressDetail}
                onChange={(event) => setAddressDetail(event.target.value)}
              />
            </Modal>
          </div>
        </div>
        <div className={styles.wrapperProductsOrder}>
          <table className={styles.productList}>
            <tbody>
              <tr>
                <th style={{ textAlign: "left" }}>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
              {selectedProducts.map((s) => (
                <tr key={s._id}>
                  <td  style={{ display: "flex", alignItems: "center" }}>
                    <img src={s.photo} alt="" />
                    <p>{s.name}</p>
                  </td>
                  <td className={styles.tdPrice}>{s.price}</td>
                  <td className={styles.tdQuantity}>x{s.quantity}</td>
                  <td className={styles.tdTotal}>{s.price * s.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.comment}>
            <p>Lời nhắn:</p>
            <input onChange={(event) => setDescription(event.target.value)} type="text" />
          </div>

          <div className={styles.totalPriceBefore}>
            <p>
              Tổng tiền cho{" "}
              {selectedProducts.reduce((total, o) => total + o.quantity, 0)} sản
              phẩm: <span>{totalPriceValue}đ</span>
            </p>
          </div>
        </div>
        <div className={styles.wrapperPay}>
          <div className={styles.payMethod}>
            <h3>Phương thức thanh toán:</h3>
            {isPaymentShown ? (
          <div style={{ display: 'flex' }} className={styles.changePayment}>
            <div
              className={`${styles.paymentItem} ${isPayPalActive ? styles.active : ''}`}
              onClick={handlePayPalClick}
            >
              PayPal
            </div>
            <div
              className={`${styles.paymentItem} ${!isPayPalActive ? styles.active : ''}`}
              onClick={handleCODClick}
            >
              Thanh toán khi nhận hàng
            </div>
          </div>
        ) : (
          <div className={styles.payBefore} style={{ display: 'flex' }}>
            <p>Thanh toán khi nhận hàng</p>
            <span onClick={handlePaymentToggle}>Thay đổi</span>
          </div>
        )}
          </div>
          <div className={styles.totalPriceAfter}>
            <table>
              <tbody>
                <tr>
                  <td>Tổng tiền hàng:</td>
                  <td>{totalPriceValue}đ</td>
                </tr>
                <tr>
                  <td>Phí vận chuyển:</td>
                  <td>11000đ</td>
                </tr>
                <tr>
                  <td>Tổng thanh toán:</td>
                  <td className={styles.td}>{totalPriceValue + 11000}đ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            {isPayPalActive && sdkReady ? (
               <div className={styles.btnPaypal}>
               <div style={{ width: "200px" }}>
                 <PayPalButton          
                  amount={ Math.round( (totalPriceValue+11000) / 23678)}
                  onSuccess={onSuccessPaypal}
                  onError={() =>{
                    alert('Error')
                  }}
                 />
               </div>
             </div>
            ) : (
              <div className={styles.btn}>
              <button style={{ width: "200px" }} onClick={handlePayment}>
                Thanh toán
              </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
