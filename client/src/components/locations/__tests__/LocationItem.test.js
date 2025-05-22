import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LocationItem from '../LocationItem';

describe('LocationItem Component', () => {
  const mockLocation = {
    id: 1,
    name: 'Тестовая локация',
    description: 'Описание тестовой локации',
    image_url: '/test-image.jpg',
    category_name: 'Природа',
    city: 'Москва'
  };

  test('renders location item correctly', () => {
    render(
      <BrowserRouter>
        <LocationItem location={mockLocation} />
      </BrowserRouter>
    );
    
    // Проверяем, что название локации отображается
    expect(screen.getByText('Тестовая локация')).toBeInTheDocument();
    
    // Проверяем, что категория отображается
    expect(screen.getByText('Природа')).toBeInTheDocument();
    
    // Проверяем, что описание локации отображается (используем регулярное выражение)
    expect(screen.getByText(/Описание тестовой локации/)).toBeInTheDocument();
    
    // Проверяем, что есть кнопка "Подробнее"
    expect(screen.getByText('Подробнее')).toBeInTheDocument();
    
    // Проверяем, что есть ссылка на детальную страницу
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/locations/1');
  });
});
