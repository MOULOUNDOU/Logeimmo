import React from 'react';

// Formate le prix en FCFA
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const PriceTag = ({ price, className = '' }) => {
  return (
    <span className={`price-tag ${className}`}>
      {formatPrice(price)}<span className="price-unit">/mois</span>
    </span>
  );
};






