import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BsFillPencilFill } from "react-icons/bs";
import { GrDocumentText } from "react-icons/gr";
import { FaUserCircle } from "react-icons/fa";
import { Menu } from "antd";

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
      getItem("Sửa hồ sơ", "6", <BsFillPencilFill />),
      getItem("Đơn mua", "2", <GrDocumentText />),
    ],
    "group"
  ),
  getItem("Tài khoản của tôi", "3", <FaUserCircle />, [
    getItem("Hồ sơ", "4"),
    getItem("Đổi mật khẩu", "5"),
  ]),
];
const MenuComponent = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const router = useRouter();

  const handleMenuClick = (item) => {
    setSelectedMenuItem(item);
  };

  useEffect(() => {
    if (selectedMenuItem === "6") {
     
    } else if (selectedMenuItem === "2") {
      router.push("/user/purchase");
    } else if (selectedMenuItem === "4") {
      router.push("/user/account/profile");
    } else if (selectedMenuItem === "5") {
      router.push("/user/account/password");
    }
  }, [selectedMenuItem]);

  return (
    <Menu
      onClick={(e) => handleMenuClick(e.key)}
      style={{
        width: 250,
        fontSize:"18px",
      }}
      defaultSelectedKeys={["1"]}
      defaultOpenKeys={["sub1"]}
      mode="inline"
      items={items} // Thay vì sử dụng children, sử dụng items
    />
  );
};

export default MenuComponent;
