// src/components/Reviews/__tests__/ReviewForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewForm from '../ReviewForm';
import reviewService from '../../../services/reviewService';

// Мокируем reviewService
jest.mock('../../../services/reviewService', () => ({
  getReviewsByLocationId: jest.fn().mockResolvedValue([]),
  addReview: jest.fn().mockResolvedValue({ id: 1, success: true }),
  updateReview: jest.fn().mockResolvedValue({ id: 1, success: true })
}));

// Мокируем localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Мокируем react-icons/fa
jest.mock('react-icons/fa', () => ({
  FaStar: () => <span data-testid="star-icon">★</span>
}));

// Мокируем setTimeout
jest.useFakeTimers();

describe('ReviewForm Component', () => {
  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
    
    // Мокируем localStorage для неавторизованного пользователя
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 1, username: 'testuser' }));
    
    // Мокируем window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() }
    });
  });
  
  test('renders review form correctly', () => {
    render(<ReviewForm locationId={1} />);
    
    // Проверяем наличие заголовка
    expect(screen.getByText('Оставить отзыв')).toBeInTheDocument();
    
    // Проверяем наличие звездного рейтинга
    expect(screen.getAllByTestId('star-icon').length).toBe(5);
    
    // Проверяем наличие поля комментария
    expect(screen.getByPlaceholderText('Поделитесь своими впечатлениями о локации')).toBeInTheDocument();
    
    // Проверяем наличие кнопки отправки
    expect(screen.getByText('Отправить отзыв')).toBeInTheDocument();
  });
  
  test('submits new review successfully', async () => {
    render(<ReviewForm locationId={1} />);
    
    // Выбираем рейтинг (кликаем на третью звезду)
    const stars = screen.getAllByTestId('star-icon');
    fireEvent.click(stars[2]);
    
    // Вводим комментарий
    fireEvent.change(screen.getByPlaceholderText('Поделитесь своими впечатлениями о локации'), {
      target: { value: 'Отличная локация!' }
    });
    
    // Отправляем форму
    fireEvent.click(screen.getByText('Отправить отзыв'));
    
    // Проверяем, что вызвана функция addReview с правильными параметрами
    expect(reviewService.addReview).toHaveBeenCalledWith({
      location_id: 1,
      rating: 3, // Индекс + 1
      comment: 'Отличная локация!'
    });
    
    // Проверяем, что появилось сообщение об успехе
    await waitFor(() => {
      expect(screen.getByText('Отзыв успешно добавлен!')).toBeInTheDocument();
    });
    
    // Проверяем, что вызван reload после таймаута
    jest.advanceTimersByTime(2000);
    expect(window.location.reload).toHaveBeenCalled();
  });
  
  test('shows error when submitting without rating', async () => {
    render(<ReviewForm locationId={1} />);
    
    // Вводим только комментарий
    fireEvent.change(screen.getByPlaceholderText('Поделитесь своими впечатлениями о локации'), {
      target: { value: 'Отличная локация!' }
    });
    
    // Отправляем форму без выбора рейтинга
    fireEvent.click(screen.getByText('Отправить отзыв'));
    
    // Проверяем, что появилось сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('Пожалуйста, выберите рейтинг')).toBeInTheDocument();
    });
    
    // Проверяем, что addReview не был вызван
    expect(reviewService.addReview).not.toHaveBeenCalled();
  });
  
  test('loads and updates existing user review', async () => {
    // Мокируем существующий отзыв пользователя
    reviewService.getReviewsByLocationId.mockResolvedValue([
      {
        id: 1,
        user_id: 1,
        rating: 4,
        comment: 'Существующий отзыв'
      }
    ]);
    
    render(<ReviewForm locationId={1} />);
    
    // Проверяем, что заголовок изменился
    await waitFor(() => {
      expect(screen.getByText('Редактировать отзыв')).toBeInTheDocument();
    });
    
    // Проверяем, что кнопка отправки изменилась
    expect(screen.getByText('Обновить отзыв')).toBeInTheDocument();
    
    // Изменяем комментарий
    fireEvent.change(screen.getByPlaceholderText('Поделитесь своими впечатлениями о локации'), {
      target: { value: 'Обновленный отзыв' }
    });
    
    // Отправляем форму
    fireEvent.click(screen.getByText('Обновить отзыв'));
    
    // Проверяем, что вызвана функция updateReview с правильными параметрами
    await waitFor(() => {
      expect(reviewService.updateReview).toHaveBeenCalledWith(1, {
        location_id: 1,
        rating: 4,
        comment: 'Обновленный отзыв'
      });
    });
  });
});
