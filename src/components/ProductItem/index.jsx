import React, { useState } from "react";
import { BsFillCartPlusFill } from "react-icons/bs";
import { useRouter } from "next/router";
import { Spin } from "antd";

const ProductItem = (props) => {
  const router = useRouter();
  const { _id, photo, name, discountedPrice, price, discount,stock } = props;
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (event) => {
    event.preventDefault();
    setAddingToCart(true);
    await props.handleAddToCart(_id);
    setAddingToCart(false);
  };


  return (
    <div className="best-p1">
      <img src={photo} alt="img" />
      {discount}
      <div className="best-p1-txt">
        <div className="name-of-p">
          <p className="product-name">{name}</p>
        </div>
        <div className="rating">
          <i className="bx bxs-star" />
          <i className="bx bxs-star" />
          <i className="bx bxs-star" />
          <i className="bx bx-star" />
          <i className="bx bx-star" />
        </div>
        <div className="price">
          <p>{discountedPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
          <del>{price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</del>
        </div>
        <div className="buy-now">
        <button onClick={handleAddToCart}>
        {addingToCart ? (
            <Spin className="loading">
            <div className="content" />
          </Spin> // Hiển thị Spin khi đang thực hiện POST API
          ):(
            <>
              <BsFillCartPlusFill
                style={{ fontSize: "20px", marginRight: "5px", marginBottom: "3px" }}
              />
              <p>Add to Cart</p>
            </>
          )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
