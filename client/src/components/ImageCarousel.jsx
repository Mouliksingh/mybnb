// client/src/components/ImageCarousel.jsx
import React, { useState } from 'react';

export default function ImageCarousel({ images, primaryImage }) {
  const imageList = images && images.length > 0 ? images : [primaryImage];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!imageList || imageList.length === 0 || !imageList[0]?.url) {
    return <div className="h-64 bg-[#F7F7F7] rounded-2xl animate-pulse" />;
  }

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-sm h-64 w-full bg-[#F7F7F7]">
      <img 
        src={imageList[currentIndex].url} 
        alt="Listing View" 
        className="w-full h-full object-cover transition-transform duration-300"
      />
      {imageList.length > 1 && (
        <>
          <button 
            onClick={prevSlide} 
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#222222] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition">
            ❮
          </button>
          <button 
            onClick={nextSlide} 
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#222222] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition">
            ❯
          </button>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {currentIndex + 1} / {imageList.length}
          </div>
        </>
      )}
    </div>
  );
}