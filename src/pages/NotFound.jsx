import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="page not-found">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page introuvable</h2>
          <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};



