// client/src/components/Reviews/ReviewList.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button } from 'react-bootstrap'; // ← ДОБАВЛЕН Button
import { FaStar, FaTrash } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import './ReviewList.css';

const ReviewList = ({ locationId, reviews: externalReviews }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Безопасное получение пользователя
  const getCurrentUser = () => {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (err) {
      console.error('Ошибка парсинга пользователя:', err);
      return null;
    }
  };
  
  const currentUser = getCurrentUser();

  // Загрузка отзывов
  useEffect(() => {
    const fetchReviews = async () => {
      // Если отзывы переданы как props, используем их
      if (externalReviews) {
        setReviews(externalReviews);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await reviewService.getReviewsByLocationId(locationId);
        
        // Поддержка разных форматов ответа API
        const reviewsData = response.reviews || response.data?.reviews || response || [];
        
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error('Ошибка при загрузке отзывов:', err);
        setError('Не удалось загрузить отзывы');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchReviews();
    }
  }, [locationId, externalReviews]);

  // Обработчик удаления отзыва
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        alert('Отзыв успешно удален');
      } catch (err) {
        console.error('Ошибка при удалении отзыва:', err);
        alert('Не удалось удалить отзыв');
      }
    }
  };

  // Функция для отображения звездочек рейтинга
  const renderStars = (rating) => {
    return (
      <div className="rating-stars d-inline-flex">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={i < rating ? "text-warning" : "text-muted"} 
            style={{ fontSize: '16px', marginRight: '2px' }}
          />
        ))}
        <span className="ms-2 text-muted">{rating}/5</span>
      </div>
    );
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    } catch (err) {
      return 'Неизвестная дата';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка отзывов...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Ошибка загрузки</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>Пока нет отзывов</Alert.Heading>
        <p>Станьте первым, кто оставит отзыв о этом месте!</p>
      </Alert>
    );
  }

  return (
    <div className="review-list">
      <h4 className="mb-4">Отзывы пользователей ({reviews.length})</h4>
      
      {reviews.map(review => (
        <Card key={review.id} className="mb-3 review-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <h5 className="mb-0 me-3">{review.username || 'Пользователь'}</h5>
                  {renderStars(review.rating)}
                </div>
                <div className="review-date text-muted">
                  {formatDate(review.created_at)}
                </div>
              </div>
              
              {currentUser && currentUser.id === review.user_id && (
                <Button 
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteReview(review.id)}
                  title="Удалить отзыв"
                >
                  <FaTrash />
                </Button>
              )}
            </div>
            
            <Card.Text className="review-comment">
              {review.comment}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;
