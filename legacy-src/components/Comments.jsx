import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';
import { getUserById } from '../services/userService';
import { getListingComments, addComment, deleteComment, updateComment } from '../services/commentsService';

export const Comments = ({ listingId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const loadComments = () => {
    const allComments = getListingComments(listingId);
    setComments(allComments);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadComments();
  }, [listingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment.trim()) {
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    try {
      addComment(user.id, user.name, listingId, newComment);
      setNewComment('');
      loadComments();
    } catch (error) {
      alert(error.message || 'Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleDelete = (commentId) => {
    if (!user) return;
    
    if (window.confirm('Supprimer ce commentaire ?')) {
      try {
        deleteComment(commentId, user.id);
        loadComments();
      } catch (error) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (commentId) => {
    if (!editText.trim()) {
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    try {
      updateComment(commentId, user.id, editText);
      setEditingId(null);
      setEditText('');
      loadComments();
    } catch (error) {
      alert(error.message || 'Erreur lors de la modification');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        Commentaires ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez un commentaire..."
            rows="3"
            className="comment-input"
          />
          <button type="submit" className="btn btn-primary btn-small">
            Publier
          </button>
        </form>
      ) : (
        <p className="comment-login-prompt">
          <a href="/login">Connectez-vous</a> pour commenter
        </p>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Aucun commentaire pour le moment. Soyez le premier !</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              {editingId === comment.id ? (
                <div className="comment-edit">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                    className="comment-input"
                  />
                  <div className="comment-edit-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleSaveEdit(comment.id)}
                    >
                      Enregistrer
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={handleCancelEdit}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="comment-header">
                    <div className="comment-author">
                      {(() => {
                        const commentUser = getUserById(comment.userId);
                        return commentUser?.profilePhoto ? (
                          <img 
                            src={commentUser.profilePhoto} 
                            alt={comment.userName}
                            className="comment-author-avatar comment-author-avatar-photo"
                          />
                        ) : (
                          <div className="comment-author-avatar comment-author-avatar-placeholder">
                            {comment.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        );
                      })()}
                      <div className="comment-author-info">
                        <strong>{comment.userName}</strong>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        {comment.updatedAt && (
                          <span className="comment-edited">(modifié)</span>
                        )}
                      </div>
                    </div>
                    {user && user.id === comment.userId && (
                      <div className="comment-actions">
                        <button
                          className="btn-link"
                          onClick={() => handleEdit(comment)}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          className="btn-link btn-link-danger"
                          onClick={() => handleDelete(comment.id)}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

