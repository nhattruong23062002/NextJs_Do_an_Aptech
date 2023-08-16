// Banner.js

import React, { useState, useEffect } from 'react';

const Banner = () => {
  const [showBanner, setShowBanner] = useState(false);

  const handleBannerClose = () => {
    setShowBanner(false);
    sessionStorage.setItem('bannerDisplayed', 'true');
  };

  useEffect(() => {
    const bannerDisplayed = sessionStorage.getItem('bannerDisplayed');
    if (!bannerDisplayed) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="banner">
      <img src="https://simyphamonline.com/wp-content/uploads/13133-119993212-3168515296580387-3081656304725558944-o-3.jpg" alt="Product Banner" />
      <button className="close-button" onClick={handleBannerClose}>
        x
      </button>
    </div>
  );
};

export default Banner;
