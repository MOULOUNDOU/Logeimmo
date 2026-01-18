import React, { useState, useMemo, useEffect } from 'react';
import { getAllListings } from '../services/listingService';
import { getCurrentUser, hasRole, USER_ROLES } from '../services/authService';
import { saveSearch } from '../services/favoritesService';
import { getMostLikedListings, getLikeCount } from '../services/likesService';
import { ListingCard } from '../components/ListingCard';
import { Filters } from '../components/Filters';
import { ListingsCarousel } from '../components/ListingsCarousel';

const ITEMS_PER_PAGE = 12;

export const Home = () => {
  const [listings, setListings] = useState([]);

  // Charger les annonces au montage du composant
  useEffect(() => {
    setListings(getAllListings());
  }, []);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    type: '',
    priceMin: '',
    priceMax: ''
  });
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset à la première page lors d'un changement de filtre
  };

  // Sauvegarder la recherche pour les locataires
  useEffect(() => {
    const user = getCurrentUser();
    if (user && hasRole(USER_ROLES.LOCATAIRE) && (filters.search || filters.city || filters.type || filters.priceMin || filters.priceMax)) {
      // Sauvegarder après un délai pour éviter trop de sauvegardes
      const timeoutId = setTimeout(() => {
        try {
          saveSearch(user.id, {
            search: filters.search,
            city: filters.city,
            type: filters.type,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax
          });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la recherche:', error);
        }
      }, 2000); // Attendre 2 secondes après le dernier changement

      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  // Filtrer et trier les annonces
  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter(listing => {
      // Filtre recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          listing.title.toLowerCase().includes(searchLower) ||
          listing.city.toLowerCase().includes(searchLower) ||
          listing.district.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtre ville
      if (filters.city && listing.city !== filters.city) return false;

      // Filtre type
      if (filters.type && listing.type !== filters.type) return false;

      // Filtre prix min
      if (filters.priceMin && listing.price < filters.priceMin) return false;

      // Filtre prix max
      if (filters.priceMax && listing.price > filters.priceMax) return false;

      return true;
    });

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popular':
          return getLikeCount(b.id) - getLikeCount(a.id);
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [listings, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredAndSortedListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Récupérer les annonces populaires (les plus likées)
  const popularListingIds = useMemo(() => getMostLikedListings(6), []);
  const popularListings = useMemo(() => {
    return popularListingIds
      .map(id => listings.find(l => l.id === id))
      .filter(Boolean);
  }, [popularListingIds, listings]);

  return (
    <div className="page home">
      <div className="container">
        <h1>Annonces de chambres et logements au Sénégal</h1>
        
        {popularListings.length > 0 && (
          <div className="popular-section">
            <ListingsCarousel 
              listings={popularListings} 
              title="⭐ Annonces populaires"
            />
          </div>
        )}
        
        <div className="home-content">
          <aside className="filters-sidebar">
            <Filters filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          <main className="listings-main">
            <div className="listings-header">
              <p className="listings-count">
                {filteredAndSortedListings.length} annonce{filteredAndSortedListings.length > 1 ? 's' : ''} trouvée{filteredAndSortedListings.length > 1 ? 's' : ''}
              </p>
              <div className="sort-controls">
                <label htmlFor="sort">Trier par :</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="recent">Plus récent</option>
                  <option value="popular">Plus populaires</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>
            </div>

            {paginatedListings.length === 0 ? (
              <div className="empty-state">
                <p>Aucune annonce trouvée pour vos critères.</p>
                <p>Essayez de modifier vos filtres de recherche.</p>
              </div>
            ) : (
              <>
                <div className="listings-grid">
                  {paginatedListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-secondary pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      aria-label="Page précédente"
                    >
                      ← Précédent
                    </button>
                    
                    <div className="pagination-numbers">
                      {/* Afficher la première page */}
                      {currentPage > 2 && (
                        <>
                          <button
                            className="pagination-number"
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </button>
                          {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
                        </>
                      )}

                      {/* Afficher les pages autour de la page actuelle */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => {
                          // Ajouter des ellipses si nécessaire
                          const prevPage = array[index - 1];
                          const showEllipsisBefore = prevPage && page - prevPage > 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="pagination-ellipsis">...</span>
                              )}
                              <button
                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      {/* Afficher la dernière page si nécessaire */}
                      {currentPage < totalPages - 1 && (
                        <>
                          {currentPage < totalPages - 2 && (
                            <span className="pagination-ellipsis">...</span>
                          )}
                          <button
                            className="pagination-number"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="btn btn-secondary pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      aria-label="Page suivante"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

