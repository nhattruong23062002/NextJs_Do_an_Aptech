import React from "react";
import { Button, Result } from "antd";
import Link from "next/link";

import HeadMeta from "@/components/HeadMeta";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
const App = () => (
  <>
    <HeadMeta title="Checkout Success"/>
    <Header />
    <Result
      status="success"
      title="Bạn đã đặt thành công đơn hàng của mình"
      subTitle="Nhấn xem đơn hàng để xem những đơn hàng đã đặt, nhấn quay lại shop để tiếp tục mua sắm"
      extra={[
        <Button type="primary" key="console">
          <Link href="/">Quay lại shop</Link>
        </Button>,
        <Button key="buy">
          <Link href="/user/purchase">Xem đơn hàng</Link>
        </Button>,
      ]}
    />
    <Footer />
  </>
);
export default App;
