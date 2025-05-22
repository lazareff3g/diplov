// src/components/Photos/__tests__/PhotoGallery.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PhotoGallery from '../PhotoGallery';

// Создаем мок-функции
const mockGetPhotosByLocationId = jest.fn();

// Мокируем модуль перед импортом компонента
jest.mock('../../../services/photoService', () => ({
  default: {
    getPhotosByLocationId: (...args) => mockGetPhotosByLocationId(...args)
  }
}));

// Мокируем localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn().mockReturnValue(null)
  }
});

describe('PhotoGallery', () => {
  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
    
    // По умолчанию мокируем ошибку, чтобы тест на ошибку проходил
    mockGetPhotosByLocationId.mockRejectedValue(new Error('Test error'));
  });

  test('renders error message when API fails', async () => {
    render(<PhotoGallery locationId={1} />);
    
    // Проверяем наличие сообщения об ошибке
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить фотографии')).toBeInTheDocument();
    });
  });
});
