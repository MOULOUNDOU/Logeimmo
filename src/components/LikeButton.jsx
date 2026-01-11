import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';
import { getLikeCount, hasUserLiked, toggleLike } from '../services/likesService';

export const LikeButton = ({ listingId, showCount = true, size = 'medium' }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Charger l'état initial
    if (currentUser) {
      setLiked(hasUserLiked(currentUser.id, listingId));
    }
    setLikeCount(getLikeCount(listingId));
  }, [listingId]);

  const handleLike = () => {
    if (!user) {
      alert('Vous devez être connecté pour liker une annonce');
      return;
    }

    try {
      toggleLike(user.id, listingId);
      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      alert('Erreur lors du like');
    }
  };

  const sizeClasses = {
    small: 'like-btn-small',
    medium: 'like-btn-medium',
    large: 'like-btn-large'
  };

  return (
    <button
      className={`like-btn ${sizeClasses[size]} ${liked ? 'liked' : ''}`}
      onClick={handleLike}
      aria-label={liked ? 'Retirer le like' : 'Ajouter un like'}
      title={liked ? 'Retirer le like' : 'Ajouter un like'}
    >
      <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
      {showCount && likeCount > 0 && (
        <span className="like-count">{likeCount}</span>
      )}
    </button>
  );
};



