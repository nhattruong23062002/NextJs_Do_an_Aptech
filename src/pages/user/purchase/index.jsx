import React from "react";
import { useState, useEffect } from "react";
import { BsFillPencilFill } from "react-icons/bs";
import { GrDocumentText } from "react-icons/gr";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { BsFillCarFrontFill } from "react-icons/bs";
import { useRouter } from "next/router";
import { ImArrowLeft2 } from "react-icons/im";
import jwt_decode from "jwt-decode";

import HeadMeta from "@/components/HeadMeta";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import styles from "./Purchase.module.css";
import { getTokenFromLocalStorage } from "@/utils/tokenUtils";
import axiosClient from "@/libraries/axiosClient";
import MenuComponent from "@/components/Menu";

const App = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [order, setOrder] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Call it once on the client side
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "completed") {
      setStatusFilter("COMPLETED");
    } else if (tabName === "waiting") {
      setStatusFilter("WAITING");
    } else if (tabName === "canceled") {
      setStatusFilter("CANCELED");
    } else if (tabName === "delivering") {
      setStatusFilter("DELIVERING");
    } else {
      setStatusFilter("");
    }
  };

  const checkLoggedIn = async () => {
    const token = getTokenFromLocalStorage();
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const { _id: customerId } = decodedToken;
        setCustomerId(customerId);
        const response = await axiosClient.get("/user/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const ordersWithMatchingCustomerId = response.data.payload.filter(order => order.customerId === customerId);

        setOrder(ordersWithMatchingCustomerId);
      } catch (error) {
        console.error("Error checking login:", error);
      }
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const handleCancelOrder = async (id, orderDetails) => {
    const token = getTokenFromLocalStorage();
    if (token) {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosClient.patch(
          `/user/orders/${id}`,
          {
            status: "CANCELED",
          },
          {
            headers,
          }
        );

        for (const o of orderDetails) {
          const newStock = o.productId.stock + o.quantity;
          // Gửi yêu cầu cập nhật stock lên server
          await axiosClient.patch(`/user/products/${o.productId._id}`, {
            stock: newStock,
          });
        }
        alert("Đơn hàng đã được hủy");
        checkLoggedIn();
      } catch (error) {
        alert("Lỗi!!!Hủy đơn hàng thất bại", error);
      }
    }
  };

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
        checkLoggedIn();
        router.push("/user/purchase");
      } catch (error) {
        alert("Lỗi!!!Hủy đơn hàng thất bại", error);
      }
    }
  };

  return (
    <>
      <HeadMeta title="Order"/>
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
          {isMobile ? (
            <div>
              <Link href="/">
                <ImArrowLeft2 style={{ fontSize: "24px", marginTop: "10px" }} />
              </Link>
              <h3 className={styles.heading}>Đơn mua</h3>
            </div>
          ) : (
            ""
          )}

          <div className={styles.wrapperContent}>
            <div className={styles.navigation}>
              <div className={styles.container}>
                <div
                  className={
                    styles.link +
                    " " +
                    (activeTab === "all" ? styles.active : "")
                  }
                  onClick={() => handleTabClick("all")}
                >
                  Tất cả
                </div>
                <div
                  className={
                    styles.link +
                    " " +
                    (activeTab === "waiting" ? styles.active : "")
                  }
                  onClick={() => handleTabClick("waiting")}
                >
                  Chờ xác nhận
                </div>
                <div
                  className={
                    styles.link +
                    " " +
                    (activeTab === "delivering" ? styles.active : "")
                  }
                  onClick={() => handleTabClick("delivering")}
                >
                  Đang giao
                </div>
                <div
                  className={
                    styles.link +
                    " " +
                    (activeTab === "completed" ? styles.active : "")
                  }
                  onClick={() => handleTabClick("completed")}
                >
                  Hoàn thành
                </div>
                <div
                  className={
                    styles.link +
                    " " +
                    (activeTab === "canceled" ? styles.active : "")
                  }
                  onClick={() => handleTabClick("canceled")}
                >
                  Đã hủy
                </div>
              </div>
            </div>
            {order.map((p) => {
              if (statusFilter === "COMPLETED" && p.status !== "COMPLETED") {
                return null;
              }
              if (statusFilter === "WAITING" && p.status !== "WAITING") {
                return null;
              }
              if (statusFilter === "CANCELED" && p.status !== "CANCELED") {
                return null;
              }
              if (statusFilter === "DELIVERING" && p.status !== "DELIVERING") {
                return null;
              }

              return (
                <div key={p._id} className={styles.wrapperOrder}>
                  <div className={styles.headingWrapOrder}>
                    <Link href={`/user/purchase/order/${p._id}`}>
                      <BsFillCarFrontFill style={{ marginRight: "5px" }} />
                      Xem tiến trình đơn hàng
                    </Link>
                    {p.status === "WAITING" && <p>Chờ xác nhận</p>}
                    {p.status === "DELIVERING" && <p>Đang giao</p>}
                    {p.status === "COMPLETED" && <p>Hoàn thành</p>}
                    {p.status === "CANCELED" && <p>Đã hủy</p>}
                  </div>
                  {p.orderDetails.map((o) => (
                    <div key={o._id} className={styles.wrapperProducts}>
                      <Link
                        href={`/user/purchase/order/${p._id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
                        <img src={o.productId.photo} alt="" />
                        <div className={styles.nameProducts}>
                          <p>{o.productId.name}</p>
                          <p style={{ fontSize: "14px" }}>x{o.quantity}</p>
                        </div>
                      </Link>
                      <span>{o.price}đ</span>
                    </div>
                  ))}
                  <div className={styles.wrapperTotal}>
                    <div className={styles.totalPrice}>
                      <h4>Thành tiền: </h4>
                      <span>
                        {p.orderDetails.reduce(
                          (total, o) =>
                            total +
                            o.price * o.quantity * (1 - p.discount / 100),
                          11000
                        )}
                        đ
                      </span>
                    </div>
                    <button
                      style={{ marginRight: "20px", padding: "0px 25px" }}
                      className={styles.btnDelivering}
                    >
                      <Link href="/cart">Mua lại</Link>
                    </button>
                    {p.status === "WAITING" && (
                      <>
                        <button
                          onClick={() =>
                            handleCancelOrder(p._id, p.orderDetails)
                          }
                          className={styles.btnCancel}
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {p.status === "CANCELED" && (
                      <button className={styles.btnCancel}>Đã hủy</button>
                    )}
                    {p.status === "COMPLETED" && (
                      <button className={styles.btnCompleted}>
                        Đã nhận được hàng
                      </button>
                    )}
                    {p.status === "DELIVERING" && (
                      <button
                        onClick={() => handleCompletedOrder(p._id)}
                        className={styles.btnDelivering}
                      >
                        Đã nhận được hàng
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
export default App;
