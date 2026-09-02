"use client";

import { useEffect, useState } from "react";

const imageUrls = [
  '/imgs/OaxacaPicture_1.jpg',
  '/imgs/OaxacaPicture_2.jpg',
  '/imgs/OaxacaPicture_3.jpg',
  '/imgs/OaxacaPicture_4.jpg',
  '/imgs/OaxacaPicture_5.jpg',
  '/imgs/OaxacaPicture_6.jpg',
  '/imgs/OaxacaPicture_7.png',
  '/imgs/OaxacaPicture_8.jpg',
  '/imgs/OaxacaPicture_9.jpg',
  '/imgs/OaxacaPicture_10.jpg',
];

export default function BackgroundSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageUrls.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 bg-black">
      {imageUrls.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
