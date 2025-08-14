// src/components/HeaderBanner.js
import React, { useRef, useEffect } from 'react';
import './HeaderBanner.css';

const HeaderBanner = ({ gifSrc }) => {
  const bannerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const banner = bannerRef.current;
      if (!banner) return;

      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;

      banner.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="header-banner float-effect shine-border" ref={bannerRef}>
      <img
        src={gifSrc}
        alt="Banner animado"
        className="parallax-img"
      />
    </div>
  );
};

export default HeaderBanner;
