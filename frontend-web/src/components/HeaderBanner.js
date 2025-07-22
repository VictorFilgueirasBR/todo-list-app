// src/components/HeaderBanner.js

import React from 'react';
import './HeaderBanner.css';

const HeaderBanner = ({ gifSrc }) => {
  return (
    <div className="header-banner">
      <img src={gifSrc} alt="Banner animado" />
    </div>
  );
};

export default HeaderBanner;
