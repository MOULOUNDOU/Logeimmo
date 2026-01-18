import React, { useState, useEffect } from 'react';
import { addToComparison, removeFromComparison, isInComparison, getComparison } from '../services/comparisonService';

export const ComparisonButton = ({ listingId }) => {
  const [inComparison, setInComparison] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);

  useEffect(() => {
    setInComparison(isInComparison(listingId));
    setComparisonCount(getComparison().length);
  }, [listingId]);

  const handleToggle = () => {
    try {
      if (inComparison) {
        removeFromComparison(listingId);
        setInComparison(false);
        setComparisonCount(prev => prev - 1);
      } else {
        addToComparison(listingId);
        setInComparison(true);
        setComparisonCount(prev => prev + 1);
      }
    } catch (error) {
      alert(error.message || 'Erreur lors de la comparaison');
    }
  };

  return (
    <button
      className={`btn btn-outline comparison-btn ${inComparison ? 'in-comparison' : ''}`}
      onClick={handleToggle}
      title={inComparison ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
    >
      {inComparison ? '✓ Dans la comparaison' : '⚖️ Comparer'}
      {comparisonCount > 0 && (
        <span className="comparison-badge">{comparisonCount}</span>
      )}
    </button>
  );
};






