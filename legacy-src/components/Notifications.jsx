import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../services/notificationsService';
import { getUserById } from '../services/userService';

export const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadNotifications = () => {
    if (!user) return;
    const userNotifications = getUserNotifications(user.id);
    setNotifications(userNotifications.slice(0, 10)); // Les 10 plus récentes
    setUnreadCount(getUnreadCount(user.id));
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      loadNotifications();
    }

    // Recharger périodiquement
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
        loadNotifications();
      }
    }, 3000); // Toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

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
    setShowDropdown(false);
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
    return date.toLocaleDateString('fr-FR');
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

  if (!user) return null;

  return (
    <div className="notifications-container">
      <button
        className="notifications-toggle"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
        title="Notifications"
      >
        <span className="notifications-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            {unreadCount > 0 && (
              <button
                className="btn-link btn-mark-all"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map(notification => {
                const relatedUser = notification.relatedUserId 
                  ? getUserById(notification.relatedUserId) 
                  : null;

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header-item">
                        {relatedUser?.profilePhoto ? (
                          <img 
                            src={relatedUser.profilePhoto} 
                            alt={relatedUser.name}
                            className="notification-user-photo"
                          />
                        ) : (
                          <div className="notification-user-photo notification-user-photo-placeholder">
                            {relatedUser?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="notification-text">
                          <strong>{notification.title}</strong>
                          <p>{notification.message}</p>
                          <span className="notification-date">{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="notification-actions">
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

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <Link 
                to="/notifications" 
                className="btn-link"
                onClick={() => setShowDropdown(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

