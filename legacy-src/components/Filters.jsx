import React from 'react';

export const Filters = ({ filters, onFilterChange }) => {
  const cities = ['Toutes', 'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'];
  const types = ['Tous', 'chambre', 'studio', 'appartement'];

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="search">Recherche</label>
        <input
          id="search"
          type="text"
          placeholder="Titre, quartier, ville..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="city">Ville</label>
        <select
          id="city"
          value={filters.city || 'Toutes'}
          onChange={(e) => onFilterChange('city', e.target.value === 'Toutes' ? '' : e.target.value)}
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          value={filters.type || 'Tous'}
          onChange={(e) => onFilterChange('type', e.target.value === 'Tous' ? '' : e.target.value)}
        >
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="priceMin">Prix min (FCFA)</label>
        <input
          id="priceMin"
          type="number"
          placeholder="0"
          value={filters.priceMin || ''}
          onChange={(e) => onFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : '')}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="priceMax">Prix max (FCFA)</label>
        <input
          id="priceMax"
          type="number"
          placeholder="500000"
          value={filters.priceMax || ''}
          onChange={(e) => onFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : '')}
        />
      </div>

      <button 
        className="btn btn-secondary" 
        onClick={() => {
          onFilterChange('search', '');
          onFilterChange('city', '');
          onFilterChange('type', '');
          onFilterChange('priceMin', '');
          onFilterChange('priceMax', '');
        }}
      >
        Réinitialiser
      </button>
    </div>
  );
};






