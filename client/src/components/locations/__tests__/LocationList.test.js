// src/components/locations/__tests__/LocationList.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LocationList from '../LocationList';

// Мокируем API
jest.mock('../../../services/api', () => ({  // Исправляем путь с '../../services/api' на '../../../services/api'
  get: jest.fn().mockImplementation((url) => {
    if (url === '/locations') {
      return Promise.resolve({
        data: [
          {
            id: 1,
            name: 'Тестовая локация 1',
            description: 'Описание тестовой локации 1',
            image_url: '/test-image-1.jpg'
          },
          {
            id: 2,
            name: 'Тестовая локация 2',
            description: 'Описание тестовой локации 2',
            image_url: '/test-image-2.jpg'
          }
        ]
      });
    }
    return Promise.resolve({ data: [] });
  })
}));

describe('LocationList Component', () => {
  test('renders locations when provided', () => {
    // Создаем тестовые данные с непустым массивом локаций
    const mockLocations = [
      {
        id: 1,
        name: 'Тестовая локация 1',
        description: 'Описание тестовой локации 1',
        image_url: '/test-image-1.jpg'
      },
      {
        id: 2,
        name: 'Тестовая локация 2',
        description: 'Описание тестовой локации 2',
        image_url: '/test-image-2.jpg'
      }
    ];

    render(
      <BrowserRouter>
        <LocationList locations={mockLocations} />
      </BrowserRouter>
    );
    
    // Проверяем, что компонент отображает названия локаций
    expect(screen.getByText('Тестовая локация 1')).toBeInTheDocument();
    expect(screen.getByText('Тестовая локация 2')).toBeInTheDocument();
    
    // Проверяем, что компонент отображает описания локаций
    expect(screen.getByText('Описание тестовой локации 1')).toBeInTheDocument();
    expect(screen.getByText('Описание тестовой локации 2')).toBeInTheDocument();
  });
  
  test('renders "Локации не найдены" message when no locations are provided', () => {
    // Тест для случая, когда передан пустой массив
    render(
      <BrowserRouter>
        <LocationList locations={[]} />
      </BrowserRouter>
    );
    
    // Проверяем наличие сообщения об отсутствии локаций
    expect(screen.getByText(/Локации не найдены/i)).toBeInTheDocument();
  });

  test('renders "Локации не найдены" message when locations is null', () => {
    // Тест для случая, когда locations равен null
    render(
      <BrowserRouter>
        <LocationList locations={null} />
      </BrowserRouter>
    );
    
    // Проверяем наличие сообщения об отсутствии локаций
    expect(screen.getByText(/Локации не найдены/i)).toBeInTheDocument();
  });

  test('renders "Локации не найдены" message when locations is undefined', () => {
    // Тест для случая, когда locations равен undefined
    render(
      <BrowserRouter>
        <LocationList locations={undefined} />
      </BrowserRouter>
    );
    
    // Проверяем наличие сообщения об отсутствии локаций
    expect(screen.getByText(/Локации не найдены/i)).toBeInTheDocument();
  });
});
