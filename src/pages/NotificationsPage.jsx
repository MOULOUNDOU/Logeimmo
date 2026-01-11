import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../services/notificationsService';
import { getUserById } from '../services/userService';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadNotifications();
  }, [navigate]);

  const loadNotifications = () => {
    if (!user) return;
    const userNotifications = getUserNotifications(user.id);
    setNotifications(userNotifications);
    setUnreadCount(getUnreadCount(user.id));
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.id);
      loadNotifications();
    }
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    loadNotifications();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
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
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'favorite':
        return '⭐';
      case 'report':
        return '🚨';
      default:
        return '🔔';
    }
  };

  if (!user) {
    return (
      <div className="page notifications-page">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page notifications-page">
      <div className="container">
        <div className="notifications-page-header">
          <h1>Notifications {unreadCount > 0 && `(${unreadCount} non lues)`}</h1>
          {unreadCount > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleMarkAllAsRead}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="notifications-page-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>Aucune notification</p>
              <p className="empty-state-hint">Vous recevrez des notifications lorsqu'il y aura de l'activité sur vos annonces.</p>
            </div>
          ) : (
            notifications.map(notification => {
              const relatedUser = notification.relatedUserId 
                ? getUserById(notification.relatedUserId) 
                : null;

              return (
                <div
                  key={notification.id}
                  className={`notification-page-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-page-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-page-content">
                    <div className="notification-page-header-item">
                      {relatedUser?.profilePhoto ? (
                        <img 
                          src={relatedUser.profilePhoto} 
                          alt={relatedUser.name}
                          className="notification-page-user-photo"
                        />
                      ) : (
                        <div className="notification-page-user-photo notification-page-user-photo-placeholder">
                          {relatedUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="notification-page-text">
                        <strong>{notification.title}</strong>
                        <p>{notification.message}</p>
                        <span className="notification-page-date">{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="notification-page-actions">
                    {!notification.read && (
                      <button
                        className="btn-link btn-mark-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Marquer comme lu"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="btn-link btn-delete-notif"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};



