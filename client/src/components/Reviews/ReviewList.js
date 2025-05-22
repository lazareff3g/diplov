// src/components/Reviews/ReviewList.js
import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { FaStar, FaTrash } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import './ReviewList.css';

const ReviewList = ({ locationId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Добавляем проверку на существование значения
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  // Загрузка отзывов
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const reviews = await reviewService.getReviewsByLocationId(locationId);
        setReviews(reviews);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке отзывов:', err);
        setError('Не удалось загрузить отзывы');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [locationId]);

  // Обработчик удаления отзыва
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews(reviews.filter(review => review.id !== reviewId));
      } catch (err) {
        console.error('Ошибка при удалении отзыва:', err);
        alert('Не удалось удалить отзыв');
      }
    }
  };

  // Функция для отображения звездочек рейтинга
  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={i < rating ? "star-filled" : "star-empty"} 
          />
        ))}
      </div>
    );
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reviews.length === 0) {
    return <Alert variant="info">Для этой локации еще нет отзывов.</Alert>;
  }

  return (
    <div className="review-list">
      <h4 className="mb-4">Отзывы пользователей</h4>
      
      {reviews.map(review => (
        <Card key={review.id} className="mb-3 review-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <h5 className="mb-0 me-2">{review.username || 'Пользователь'}</h5>
                  {renderStars(review.rating)}
                </div>
                <div className="review-date text-muted mb-3">
                  {formatDate(review.created_at)}
                </div>
              </div>
              
              {currentUser && currentUser.id === review.user_id && (
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  <FaTrash />
                </button>
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
