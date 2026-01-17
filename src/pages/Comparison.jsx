import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComparison, clearComparison } from '../services/comparisonService';
import { getListingById } from '../services/listingService';
import { PriceTag } from '../components/PriceTag';
import { LikeButton } from '../components/LikeButton';
import { getViewCount } from '../services/viewsService';
import { getCommentCount } from '../services/commentsService';

export const Comparison = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const comparisonIds = getComparison();
    const comparisonListings = comparisonIds
      .map(id => getListingById(id))
      .filter(listing => listing !== null);
    setListings(comparisonListings);
  }, []);

  const handleClear = () => {
    if (window.confirm('Vider la comparaison ?')) {
      clearComparison();
      setListings([]);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="page comparison">
        <div className="container">
          <h1>Comparaison d'annonces</h1>
          <div className="empty-state">
            <p>Aucune annonce à comparer.</p>
            <p>Ajoutez des annonces à la comparaison depuis les pages de détails.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Parcourir les annonces
            </button>
          </div>
        </div>
      </div>
    );
  }

  const features = ['Prix', 'Caution', 'Type', 'Ville', 'Quartier', 'Vues', 'Likes', 'Commentaires'];

  return (
    <div className="page comparison">
      <div className="container">
        <div className="comparison-header">
          <h1>Comparaison d'annonces ({listings.length})</h1>
          <button className="btn btn-danger" onClick={handleClear}>
            Vider la comparaison
          </button>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Caractéristique</th>
                {listings.map(listing => (
                  <th key={listing.id}>
                    <div className="comparison-listing-header">
                      <img 
                        src={listing.photos?.[0] || 'https://via.placeholder.com/200?text=Photo'} 
                        alt={listing.title}
                        className="comparison-thumbnail"
                      />
                      <h3>{listing.title}</h3>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        Voir détails
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Prix mensuel</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>
                    <PriceTag price={listing.price} />
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Caution</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>
                    {listing.deposit ? <PriceTag price={listing.deposit} /> : '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Type</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>{listing.type}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Ville</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>{listing.city}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Quartier</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>{listing.district}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Vues</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>{getViewCount(listing.id)}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Likes</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>
                    <LikeButton listingId={listing.id} size="small" />
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Commentaires</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>{getCommentCount(listing.id)}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Équipements</strong></td>
                {listings.map(listing => (
                  <td key={listing.id}>
                    <ul className="comparison-amenities">
                      {listing.amenities?.map((amenity, i) => (
                        <li key={i}>✓ {amenity}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};






