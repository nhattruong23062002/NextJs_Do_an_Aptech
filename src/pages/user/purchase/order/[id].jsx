import React from "react";
import { useState, useEffect } from "react";
import { BsFillPencilFill } from "react-icons/bs";
import { GrDocumentText } from "react-icons/gr";
import { FaUserCircle } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { Steps } from "antd";
import { useRouter } from "next/router";
import { SmileOutlined, SolutionOutlined } from "@ant-design/icons";
import { BsFillCarFrontFill } from "react-icons/bs";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import moment from "moment";
import jwt_decode from "jwt-decode";

import HeadMeta from "@/components/HeadMeta";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import styles from "./../Purchase.module.css";
import { getTokenFromLocalStorage } from "@/utils/tokenUtils";
import axiosClient from "@/libraries/axiosClient";
import MenuComponent from "@/components/Menu";


function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem(
    "",
    "grp",
    null,
    [
      getItem("Sửa hồ sơ", "13", <BsFillPencilFill />),
      getItem("Đơn mua", "14", <GrDocumentText />),
    ],
    "group"
  ),
  getItem("Tài khoản của tôi", "sub4", <FaUserCircle />, [
    getItem("Hồ sơ", "2"),
    getItem("Đổi mật khẩu", "3"),
  ]),
];
const App = () => {
  const [order, setOrder] = useState([]);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const router = useRouter();
  const { id } = router.query; // Lấy giá trị của id từ URL

  // Tiến hành lọc những order có id trùng với id lấy từ URL
  const filteredOrder = order.filter((o) => o._id === id);

  const onClick = (e) => {
    console.log("click ", e);
  };

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
        } = decodedToken;
        setPhoneNumber(phoneNumber);
        setFullName(firstName + " " + lastName);
      } catch (error) {
        console.error("Error decoding token:", error);
        setCustomerId(null);
      }
    }
  }, []);
  
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
          setOrder(response.data.payload);
        } catch (error) {
          console.error("Error checking login:", error);
        }
      }
    };
    checkLoggedIn();
  }, []);

  const handleCompletedOrder = async (id) => {
    const token = getTokenFromLocalStorage();
    if (token) {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosClient.patch(
          `/user/orders/${id}`,
          {
            status: "COMPLETED",
          },
          {
            headers,
          }
        );
        alert("Đơn hàng đã được xác nhận giao thành công");
      } catch (error) {
        alert("Lỗi!!!Hủy đơn hàng thất bại", error);
      }
    }
  };

  return (
    <>
      <HeadMeta title="Order Detail" />
      <Header />
      <main className={styles.main}>
        <div style={{ display: "flex" }} className="container">
          <div className={styles.wrapperSidebar}>
            <img
              src="https://wallpapers.com/images/featured/background-design-background-6tgpche84avnjqvz.jpg"
              alt=""
            />
            <MenuComponent />
          </div>
          <div className={styles.wrapperOrderDetail}>
            <div className={styles.headingOrderDetail}>
              <Link href="/user/purchase">
                <IoIosArrowBack />
                Trở lại
              </Link>
              {filteredOrder.map((p) => (
                <div key={p._id}>
                  {p.status === "WAITING" && <p>Chờ xác nhận</p>}
                  {p.status === "CANCELED" && <p>Đã hủy</p>}
                  {p.status === "DELIVERING" && <p>Đang giao</p>}
                  {p.status === "COMPLETED" && <p>Hoàn thành</p>}
                </div>
              ))}
            </div>
            {filteredOrder.map((p) => {
              // Tìm vị trí của bước đã hoàn thành
              const completedIndex =
                p.status === "COMPLETED"
                  ? 3
                  : p.status === "DELIVERING"
                    ? 2
                    : p.status === "WAITING"
                      ? 1
                      : 0;
              const momentObj = moment(p.createdDate);
              const normalFormat = momentObj.format("DD/MM/YYYY HH:mm:ss");

              return (
                <div key={p._id} className={styles.wrapperProgress}>
                  <Steps
                    items={[
                      {
                        title: "Đã đặt đơn",
                        status: completedIndex >= 0 ? "finish" : "",
                        icon: <SolutionOutlined />,
                      },
                      {
                        title: "Chờ xác nhận",
                        status: completedIndex >= 1 ? "finish" : "",
                        icon: <FaMoneyBill1Wave />,
                      },
                      {
                        title: "Đang giao hàng",
                        status: completedIndex >= 2 ? "finish" : "",
                        icon: <BsFillCarFrontFill />,
                      },
                      {
                        title: "Giao thành công",
                        status: completedIndex >= 3 ? "finish" : "",
                        icon: <SmileOutlined />,
                      },
                    ]}
                  />
                  <div style={{ display: "flex" }}>
                    <p className={styles.createdDate}>
                      Ngày đặt: {normalFormat}
                    </p>
                    {p.status === "WAITING" ||
                      (p.status === "DELIVERING" && (
                        <button
                          onClick={() => handleCompletedOrder(p._id)}
                          className={styles.btnDeliveringDetail}
                        >
                          Đã nhận được hàng
                        </button>
                      ))}
                    {p.status === "CANCELED" && (
                      <h4 className={styles.h4Canceled}>
                        Đơn hàng đã được hủy
                      </h4>
                    )}
                  </div>
                </div>
              );
            })}

            <div className={styles.infoOrderDetail}>
              {filteredOrder.map((p) => (
                <div key={p._id}>
                  <div className={styles.addressOrderDetail}>
                    <h3>Địa chỉ nhận hàng</h3>
                    <h4>{fullName}</h4>
                    <p>{phoneNumber}</p>
                    <p>{p.shippingAddress}</p>
                  </div>
                  <div className={styles.wrapperOrder}>
                    {p.orderDetails.map((o) => (
                      <div key={o._id} className={styles.wrapperProducts}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={o.productId.photo} alt="" />
                          <div className={styles.nameProducts}>
                            <p>{o.productId.name}</p>
                            <p style={{ fontSize: "14px" }}>x{o.quantity}</p>
                          </div>
                        </div>
                        <span>
                          {o.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.totalPriceAfter}>
                    <table>
                      <tbody>
                        <tr>
                          <td>Tổng tiền hàng:</td>
                          <td>
                            {p.orderDetails
                              .reduce(
                                (total, o) => total + o.price * o.quantity,
                                0
                              )
                              .toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                          </td>
                        </tr>
                        <tr>
                          <td>Giảm giá:</td>
                          <td>
                            {p.orderDetails
                              .reduce(
                                (total, o) =>
                                  total +
                                  o.price * o.quantity * (p.discount / 100),
                                0
                              )
                              .toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                          </td>
                        </tr>
                        <tr>
                          <td>Phí vận chuyển:</td>
                          <td>{(11000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                        </tr>
                        <tr>
                          <td>Tổng thanh toán:</td>
                          {p.paymentType === "CASH" ? (
                            <td className={styles.td}>
                              {" "}
                              {p.orderDetails
                                .reduce(
                                  (total, o) =>
                                    total +
                                    o.price *
                                    o.quantity *
                                    (1 - p.discount / 100),
                                  11000
                                )
                                .toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                            </td>
                          ) : (
                            <td className={styles.td}>{(0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                          )}
                        </tr>
                        <tr>
                          <td>Phương thức thanh toán:</td>
                          <td>
                            {p.paymentType === "CASH"
                              ? "Thanh toán khi nhận hàng"
                              : "Đã thanh toán bằng Paypal"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
export default App;
