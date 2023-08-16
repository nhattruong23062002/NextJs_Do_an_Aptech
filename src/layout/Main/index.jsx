import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import ProductGallery from '../../components/ProductGallery';
import { FaRocketchat, FaCommentDots, FaCommentsDollar } from "react-icons/fa";

function Main({ suppliers }) {
    return (
        <main className='body-content'>
            <div className="container" >
                <section className="section section-one md-flex-column">
                    <aside className="categories">
                        <h2 className="cat-title">NHÀ CUNG CẤP CHÍNH</h2>
                        {suppliers.length > 0 ? (
                            <ul className="side-menu">
                                {suppliers.map((supplier, index) => (
                                    <li key={supplier._id}><a href="#">{supplier.name}</a></li>
                                ))}
                            </ul>
                        ) : (
                            <span>Không có nhà cung cấp nào</span>
                        )}

                        <div className="btn btn-sale">Huge Sale -
                            <strong>70%</strong>
                            Off</div>
                    </aside>
                    <div className="banner-main">
                        <div className="owl-carousel owl-theme">
                            <div className="item">
                                <ProductGallery />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="section section-two md-flex-column">
                    <div className="info-box">
                        <div className="icon"><FaRocketchat /></div>

                        <div className="info-content">
                            <h4>FREE SHIPPING & RETURN</h4>
                            <p>Free shipping on all orders over $99.</p>
                        </div>
                    </div>
                    <div className="info-box">
                        <div className="icon"><FaCommentsDollar /></div>

                        <div className="info-content">
                            <h4>MONEY BACK GUARANTEE</h4>
                            <p>100% money backs guarantee</p>
                        </div>
                    </div>
                    <div className="info-box">
                        <div className="icon"><FaCommentDots /></div>

                        <div className="info-content">
                            <h4>ONLINE SUPPORT 24/7</h4>
                            <p>orem ipsum dolor sit amet..</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Main;