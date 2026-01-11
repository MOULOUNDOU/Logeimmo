import React from 'react';

export const Map = ({ latitude, longitude, title, city, district }) => {
  if (!latitude || !longitude) {
    return null;
  }

  // Utiliser OpenStreetMap avec Leaflet via iframe (solution simple sans dépendance)
  // Alternative : utiliser Google Maps Embed API
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(longitude) - 0.01},${parseFloat(latitude) - 0.01},${parseFloat(longitude) + 0.01},${parseFloat(latitude) + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  
  const openStreetMapLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;

  return (
    <div className="map-container">
      <div className="map-wrapper">
        <iframe
          width="100%"
          height="400"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={mapUrl}
          title={`Carte pour ${title || city || district}`}
          className="map-iframe"
        />
      </div>
      <div className="map-footer">
        <a
          href={openStreetMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-small"
        >
          🗺️ Voir sur OpenStreetMap
        </a>
        <a
          href={`https://www.google.com/maps?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-small"
        >
          📍 Voir sur Google Maps
        </a>
      </div>
      <p className="map-coordinates">
        Coordonnées : {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
      </p>
    </div>
  );
};



