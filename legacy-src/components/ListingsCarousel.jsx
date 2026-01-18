import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PriceTag } from './PriceTag';

export const ListingsCarousel = ({ listings, title = 'Annonces', autoPlay = true, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Ajuster le nombre d'éléments à afficher selon la taille de l'écran
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(3);
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  // Défilement automatique
  useEffect(() => {
    if (!autoPlay || isPaused || !listings || listings.length === 0) {
      return;
    }

    const totalSlides = Math.ceil(listings.length / itemsToShow);
    if (totalSlides <= 1) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = totalSlides - 1;
        return prev < maxIndex ? prev + 1 : 0;
      });
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, isPaused, listings, itemsToShow, autoPlayInterval]);

  if (!listings || listings.length === 0) {
    return null;
  }

  const totalSlides = Math.ceil(listings.length / itemsToShow);
  const maxIndex = totalSlides - 1;

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    setIsPaused(true);
    // Reprendre après un délai
    setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    setIsPaused(true);
    // Reprendre après un délai
    setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    // Reprendre après un délai
    setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div 
      className="listings-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-header">
        <h2>{title}</h2>
        {totalSlides > 1 && (
          <div className="carousel-controls">
            <button
              className="carousel-btn carousel-btn-prev"
              onClick={goToPrevious}
              aria-label="Précédent"
            >
              ←
            </button>
            <span className="carousel-indicator">
              {currentIndex + 1} / {totalSlides}
            </span>
            <button
              className="carousel-btn carousel-btn-next"
              onClick={goToNext}
              aria-label="Suivant"
            >
              →
            </button>
          </div>
        )}
      </div>

      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const slideListings = listings.slice(
              slideIndex * itemsToShow,
              slideIndex * itemsToShow + itemsToShow
            );
            return (
              <div key={slideIndex} className="carousel-slide">
                {slideListings.map(listing => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="carousel-card"
                  >
                    <div className="carousel-card-image">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                          }}
                        />
                      ) : (
                        <div className="carousel-card-placeholder">
                          📷
                        </div>
                      )}
                      <div className="carousel-card-badge">
                        {listing.type === 'chambre' ? 'Chambre' :
                         listing.type === 'studio' ? 'Studio' : 'Appartement'}
                      </div>
                    </div>
                    <div className="carousel-card-content">
                      <h3 className="carousel-card-title">{listing.title}</h3>
                      <p className="carousel-card-location">
                        📍 {listing.district}, {listing.city}
                      </p>
                      <div className="carousel-card-price">
                        <PriceTag price={listing.price} />
                        <span className="carousel-card-period">/mois</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {totalSlides > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Aller à la slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

