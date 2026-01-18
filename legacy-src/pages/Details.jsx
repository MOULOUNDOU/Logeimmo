import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById, reportListing } from '../services/listingService';
import { getCurrentUser, hasRole, USER_ROLES } from '../services/authService';
import { isFavorite, addFavorite, removeFavorite } from '../services/favoritesService';
import { recordView, getViewCount } from '../services/viewsService';
import { getUserById } from '../services/userService';
import { Gallery } from '../components/Gallery';
import { PriceTag } from '../components/PriceTag';
import { Modal } from '../components/Modal';
import { LikeButton } from '../components/LikeButton';
import { Comments } from '../components/Comments';
import { ComparisonButton } from '../components/ComparisonButton';
import { Map } from '../components/Map';

export const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = getListingById(id);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser && listing) {
      setFavorited(isFavorite(currentUser.id, listing.id));
    }
    
    // Enregistrer une vue
    if (listing) {
      recordView(listing.id, currentUser?.id || null);
    }
  }, [listing]);

  if (!listing) {
    return (
      <div className="page details">
        <div className="container">
          <div className="empty-state">
            <h2>Annonce introuvable</h2>
            <p>L'annonce que vous recherchez n'existe pas ou a été supprimée.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typeLabels = {
    chambre: 'Chambre',
    studio: 'Studio',
    appartement: 'Appartement'
  };

  const amenityLabels = {
    wifi: 'WiFi',
    climatisation: 'Climatisation',
    eau: 'Eau courante',
    'eau courante': 'Eau courante',
    électricité: 'Électricité',
    'cuisine équipée': 'Cuisine équipée',
    'cuisine partagée': 'Cuisine partagée',
    terrasse: 'Terrasse',
    gardien: 'Gardien',
    ascenseur: 'Ascenseur',
    parking: 'Parking',
    'vue mer': 'Vue mer',
    balcon: 'Balcon',
    salon: 'Salon',
    neuf: 'Neuf',
    'eau chaude': 'Eau chaude'
  };

  const handleReport = (e) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      alert('Veuillez sélectionner un motif de signalement');
      return;
    }
    try {
      reportListing(listing.id, reportReason, reportMessage);
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        setReportReason('');
        setReportMessage('');
      }, 2000);
    } catch (error) {
      alert('Erreur lors du signalement. Veuillez réessayer.');
    }
  };

  const whatsappUrl = `https://wa.me/${listing.whatsapp?.replace(/[^0-9]/g, '')}?text=Bonjour, je suis intéressé(e) par votre annonce "${listing.title}"`;
  const phoneUrl = `tel:${listing.phone?.replace(/[^0-9+]/g, '')}`;
  const shareUrl = `${window.location.origin}/listing/${listing.id}`;
  const shareText = `Découvrez cette annonce : ${listing.title} - ${listing.district}, ${listing.city}`;
  const shareWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const viewCount = getViewCount(listing.id);

  return (
    <div className="page details">
      <div className="container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Retour
        </button>

        <div className="details-content">
          <div className="details-gallery">
            <Gallery photos={listing.photos} />
          </div>

          <div className="details-info">
            <h1>{listing.title}</h1>
            <p className="details-location">
              {listing.district}, {listing.city}
            </p>

            {listing.userId && (() => {
              const owner = getUserById(listing.userId);
              if (owner) {
                return (
                  <div className="details-owner">
                    <span className="details-owner-label">Publié par :</span>
                    <div className="details-owner-info">
                      {owner.profilePhoto ? (
                        <img 
                          src={owner.profilePhoto} 
                          alt={owner.name}
                          className="details-owner-photo"
                        />
                      ) : (
                        <div className="details-owner-photo details-owner-photo-placeholder">
                          {owner.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="details-owner-name">{owner.name}</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="details-price-section">
              <PriceTag price={listing.price} className="details-price" />
              {listing.deposit && (
                <p className="details-deposit">
                  Caution : <PriceTag price={listing.deposit} />
                </p>
              )}
            </div>

            <div className="details-meta">
              <span className="badge badge-type">
                {typeLabels[listing.type] || listing.type}
              </span>
              <div className="details-stats">
                <LikeButton listingId={listing.id} size="medium" />
                <span className="view-count">👁️ {getViewCount(listing.id)} vues</span>
              </div>
            </div>

            <div className="details-section">
              <h2>Description</h2>
              <p>{listing.description}</p>
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="details-section">
                <h2>Équipements</h2>
                <ul className="amenities-list">
                  {listing.amenities.map((amenity, index) => (
                    <li key={index}>
                      ✓ {amenityLabels[amenity.toLowerCase()] || amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {listing.latitude && listing.longitude && (
              <div className="details-section">
                <h2>Localisation</h2>
                <Map
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  title={listing.title}
                  city={listing.city}
                  district={listing.district}
                />
              </div>
            )}

            <div className="details-section">
              <h2>Contact</h2>
              <div className="contact-buttons">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-whatsapp"
                >
                  📱 WhatsApp
                </a>
                <a
                  href={phoneUrl}
                  className="btn btn-secondary btn-call"
                >
                  📞 Appeler
                </a>
                {user && hasRole(USER_ROLES.LOCATAIRE) && (
                  <button
                    className={`btn ${favorited ? 'btn-primary' : 'btn-outline'} btn-favorite`}
                    onClick={() => {
                      if (favorited) {
                        removeFavorite(user.id, listing.id);
                        setFavorited(false);
                      } else {
                        addFavorite(user.id, listing.id);
                        setFavorited(true);
                      }
                    }}
                  >
                    {favorited ? '❤️ Retiré des favoris' : '🤍 Ajouter aux favoris'}
                  </button>
                )}
              </div>
            </div>

            <div className="details-actions">
              <div className="share-section">
                <h3>Partager cette annonce</h3>
                <div className="share-buttons">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Lien copié dans le presse-papiers !');
                    }}
                  >
                    📋 Copier le lien
                  </button>
                  <a
                    href={shareWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-small btn-whatsapp"
                  >
                    📱 Partager sur WhatsApp
                  </a>
                </div>
              </div>

              <div className="action-buttons">
                <ComparisonButton listingId={listing.id} />
                <button
                  className="btn btn-outline btn-report"
                  onClick={() => setShowReportModal(true)}
                >
                  Signaler cette annonce
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="details-comments">
          <Comments listingId={listing.id} />
        </div>

        <Modal
          isOpen={showReportModal}
          onClose={() => {
            if (!reportSubmitted) {
              setShowReportModal(false);
              setReportReason('');
              setReportMessage('');
            }
          }}
          title="Signaler une annonce"
        >
          {reportSubmitted ? (
            <div className="report-success">
              <p>✓ Votre signalement a été enregistré. Merci !</p>
            </div>
          ) : (
            <form onSubmit={handleReport} className="report-form">
              <div className="form-group">
                <label htmlFor="reason">Motif du signalement *</label>
                <select
                  id="reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez un motif</option>
                  <option value="fraud">Annonce frauduleuse</option>
                  <option value="duplicate">Doublon / Annonce dupliquée</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="expired">Annonce expirée</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message (optionnel)</label>
                <textarea
                  id="message"
                  rows="4"
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Décrivez le problème..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Envoyer le signalement
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

