import React, { useState } from 'react';

export const Gallery = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="gallery">
        <img 
          src="https://via.placeholder.com/800x600?text=Photo+non+disponible" 
          alt="Photo non disponible"
        />
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={photos[currentIndex]} alt={`Photo ${currentIndex + 1}`} />
        {photos.length > 1 && (
          <>
            <button 
              className="gallery-nav gallery-prev" 
              onClick={prevPhoto}
              aria-label="Photo précédente"
            >
              ‹
            </button>
            <button 
              className="gallery-nav gallery-next" 
              onClick={nextPhoto}
              aria-label="Photo suivante"
            >
              ›
            </button>
          </>
        )}
        <div className="gallery-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbnails">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={photo} alt={`Miniature ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};



