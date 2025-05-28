// client/src/components/Reviews/ReviewForm.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import './ReviewForm.css';

const ReviewForm = ({ locationId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Проверка, оставил ли пользователь уже отзыв
  useEffect(() => {
    const checkUserReview = async () => {
      try {
        // ИСПРАВЛЕНИЕ: Используем правильный метод API
        const response = await reviewService.getReviewsByLocationId(locationId);
        const reviews = response.reviews || response; // Поддержка разных форматов ответа
        
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (currentUser && reviews) {
          const existingReview = reviews.find(review => review.user_id === currentUser.id);
          if (existingReview) {
            setUserReview(existingReview);
            setRating(existingReview.rating);
            setComment(existingReview.comment);
          }
        }
      } catch (err) {
        console.error('Ошибка при проверке отзыва пользователя:', err);
      }
    };

    if (locationId) {
      checkUserReview();
    }
  }, [locationId]);

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Пожалуйста, выберите рейтинг');
      return;
    }

    if (!comment.trim()) {
      setError('Пожалуйста, напишите комментарий');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const reviewData = {
        location_id: parseInt(locationId),
        rating: parseInt(rating),
        comment: comment.trim()
      };
      
      let result;
      
      if (userReview) {
        // ИСПРАВЛЕНИЕ: Обновление существующего отзыва (если API поддерживает)
        result = await reviewService.updateReview(userReview.id, reviewData);
      } else {
        // Создание нового отзыва
        result = await reviewService.addReview(reviewData);
      }
      
      setSuccess(true);
      
      // ИСПРАВЛЕНИЕ: Вызываем callback вместо перезагрузки страницы
      if (onReviewAdded && result.review) {
        onReviewAdded(result.review);
      }
      
      // Сбрасываем форму через 2 секунды
      setTimeout(() => {
        if (!userReview) {
          setRating(0);
          setComment('');
        }
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
      setError(err.response?.data?.message || err.message || 'Не удалось отправить отзыв');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form mb-4">
      <h4 className="mb-3">{userReview ? 'Редактировать отзыв' : 'Оставить отзыв'}</h4>
      
      {success ? (
        <Alert variant="success">
          Отзыв успешно {userReview ? 'обновлен' : 'добавлен'}!
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Рейтинг</Form.Label>
            <div className="star-rating">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                
                return (
                  <label key={index} style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                      style={{ display: 'none' }}
                    />
                    <FaStar
                      className="star"
                      color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      size={30}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                      style={{ marginRight: '5px', cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
              <span className="ms-2">
                {rating > 0 ? `${rating}/5` : 'Выберите оценку'}
              </span>
            </div>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Комментарий</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь своими впечатлениями о локации"
              maxLength={1000}
            />
            <Form.Text className="text-muted">
              {comment.length}/1000 символов
            </Form.Text>
          </Form.Group>
          
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={submitting || rating === 0 || !comment.trim()}
          >
            {submitting ? 'Отправка...' : (userReview ? 'Обновить отзыв' : 'Отправить отзыв')}
          </Button>
        </Form>
      )}
    </div>
  );
};

export default ReviewForm;
