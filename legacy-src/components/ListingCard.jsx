import React from 'react';
import { Link } from 'react-router-dom';
import { PriceTag } from './PriceTag';
import { LikeButton } from './LikeButton';
import { getUserById } from '../services/userService';

export const ListingCard = ({ listing, disableLink = false }) => {
  const typeLabels = {
    chambre: 'Chambre',
    studio: 'Studio',
    appartement: 'Appartement'
  };

  const owner = listing.userId ? getUserById(listing.userId) : null;

  const cardContent = (
    <>
        <div className="listing-card-image">
          <img 
            src={listing.photos?.[0] || 'https://via.placeholder.com/400x300?text=Photo'} 
            alt={listing.title}
            loading="lazy"
          />
          <div className="listing-card-overlay">
            <LikeButton listingId={listing.id} size="small" />
          </div>
        </div>
        <div className="listing-card-content">
          <h3 className="listing-card-title">{listing.title}</h3>
          <p className="listing-card-location">
            {listing.district}, {listing.city}
          </p>
          {owner && (
            <div className="listing-card-owner">
              {owner.profilePhoto ? (
                <img 
                  src={owner.profilePhoto} 
                  alt={owner.name}
                  className="listing-owner-photo"
                />
              ) : (
                <div className="listing-owner-photo listing-owner-photo-placeholder">
                  {owner.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="listing-owner-name">{owner.name}</span>
            </div>
          )}
          <div className="listing-card-footer">
            <span className="listing-card-type">{typeLabels[listing.type] || listing.type}</span>
            <PriceTag price={listing.price} />
          </div>
        </div>
    </>
  );

  return (
    <div className="listing-card-wrapper">
      {disableLink ? (
        <div className="listing-card">
          {cardContent}
        </div>
      ) : (
        <Link to={`/listing/${listing.id}`} className="listing-card">
          {cardContent}
        </Link>
      )}
    </div>
  );
};

