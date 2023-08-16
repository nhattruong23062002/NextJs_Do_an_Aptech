import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Categories.module.css";
import queryString from "query-string";

const Categories = ({ categories }) => {
  return (
    <section className={styles.categories}>
      <div className="container">
        <h4 className={styles.h3}>Shop by Categories</h4>
      </div>
      {categories.length > 0 ? (
        <div className={`${styles.categories} container`}>
          {categories.map((category, index) => (
            <Link
              key={category._id}
              href={{
                pathname: "/filterProducts",
                search: queryString.stringify({ categoryIds: category._id }),
              }}
            >
              <div className={styles.content}>
                <img src={category.photo} alt="img" />
                <div className={styles.imgContent}>
                  <p>{category.name}</p>
                  <span>View more</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <small>Không có nhà cung cấp</small>
      )}
    </section>
  );
};

export default Categories;
