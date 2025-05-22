// src/components/Reviews/__tests__/ReviewList.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewList from '../ReviewList';

// Мокируем сервис отзывов
jest.mock('../../../services/reviewService', () => {
  return {
    default: {
      getReviewsByLocationId: jest.fn().mockRejectedValue(new Error('Test error'))
    }
  };
});

// Мокируем localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn().mockReturnValue(null)  // Возвращаем null вместо undefined
  }
});

describe('ReviewList Component', () => {
  test('renders error message when API fails', async () => {
    render(<ReviewList locationId={1} />);
    
    // Проверяем, что сообщение об ошибке отображается
    expect(screen.getByText('Не удалось загрузить отзывы')).toBeInTheDocument();
  });
});
