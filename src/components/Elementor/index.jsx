import React from 'react'
import styles from './Elementor.module.css'

const Elementor = () => {
  return (
    <div className={styles.wrapper}>
        <div className={styles.wrapperItem1}>
            <img src="https://sktperfectdemo.com/themepack/cosmetics/wp-content/uploads/2021/07/skincare-col-img.png" alt="skincare" />
            <div className={styles.title}>
                <p>BEST OF</p>
                <h3>Skincare</h3>
            </div>
            <button>Explore</button>
        </div>
        <div className={styles.wrapperItem2}>
            <img src="https://sktperfectdemo.com/themepack/cosmetics/wp-content/uploads/2021/07/make-img2.png" alt="makeup" />
            <div className={styles.title}>
                <p>TOP BRANDS</p>
                <h3>Makeup</h3>
            </div>
            <button>Explore</button>
        </div>
    </div>
  )
}

export default Elementor