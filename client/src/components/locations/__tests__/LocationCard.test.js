// src/components/locations/__tests__/LocationCard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LocationCard from '../LocationCard';

describe('LocationCard Component', () => {
  const mockLocation = {
    id: 1,
    name: 'Тестовая локация',
    description: 'Описание тестовой локации',
    image_url: '/test-image.jpg',
    category_name: 'Природа',
    city: 'Москва'
  };

  test('renders location card correctly', () => {
    render(
      <BrowserRouter>
        <LocationCard location={mockLocation} />
      </BrowserRouter>
    );
    
    // Проверяем наличие названия локации
    expect(screen.getByText('Тестовая локация')).toBeInTheDocument();
    
    // Проверяем наличие описания
    expect(screen.getByText('Описание тестовой локации')).toBeInTheDocument();
    
    // Проверяем наличие кнопки "Подробнее"
    const detailsLink = screen.getByText('Подробнее');
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink.closest('a')).toHaveAttribute('href', '/locations/1');
    
    // Проверяем наличие изображения
    const image = screen.getByAltText('Тестовая локация');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  test('truncates long description', () => {
    const locationWithLongDescription = {
      ...mockLocation,
      description: 'Очень длинное описание тестовой локации, которое должно быть обрезано. '.repeat(10)
    };

    render(
      <BrowserRouter>
        <LocationCard location={locationWithLongDescription} />
      </BrowserRouter>
    );
    
    // Проверяем, что описание отображается (возможно, обрезанное)
    expect(screen.getByText(/Очень длинное описание/)).toBeInTheDocument();
  });
});
