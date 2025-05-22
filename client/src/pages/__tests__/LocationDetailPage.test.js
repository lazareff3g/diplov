// src/__tests__/LocationDetailPage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import LocationDetailPage from '../LocationDetailPage';

// Мокаем react-icons/fa
jest.mock('react-icons/fa', () => ({
  FaHeart: () => 'FaHeart',
  FaRegHeart: () => 'FaRegHeart',
  FaStar: () => 'FaStar',
  FaEdit: () => 'FaEdit',
  FaTrash: () => 'FaTrash',
  FaMapMarkerAlt: () => 'FaMapMarkerAlt'
}));

// Мокаем react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Мокаем Яндекс Карты
jest.mock('@pbe/react-yandex-maps', () => ({
  YMaps: ({ children }) => <div data-testid="ymaps">{children}</div>,
  Map: ({ children }) => <div data-testid="map">{children}</div>,
  Placemark: () => <div data-testid="placemark"></div>
}));

// Создаем мок-стор
const mockStore = configureStore([]);

describe('LocationDetailPage Component', () => {
  let store;
  
  const mockLocation = {
    id: 1,
    name: 'Тестовая локация',
    description: 'Подробное описание тестовой локации',
    image_url: '/test-image.jpg',
    city: 'Москва',
    address: 'Тестовый адрес',
    latitude: 55.7558,
    longitude: 37.6173,
    created_by: 1,
    creator_username: 'testuser',
    created_at: '2025-05-15T12:00:00Z',
    category_name: 'Природа',
    best_time_of_day: 'morning',
    best_season: 'summer',
    accessibility: 'car',
    difficulty_level: 'easy',
    permission_required: false
  };
  
  beforeEach(() => {
    // Настраиваем стор для аутентифицированного пользователя-владельца
    store = mockStore({
      locations: {
        location: mockLocation,
        loading: false,
        error: null
      },
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser'
        }
      }
    });
  });
  
  test('renders loading state', () => {
    // Настраиваем стор для состояния загрузки
    store = mockStore({
      locations: {
        location: null,
        loading: true,
        error: null
      },
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser'
        }
      }
    });
    
    render(
      <Provider store={store}>
        <LocationDetailPage />
      </Provider>
    );
    
    expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
  });
  
  test('renders error state', () => {
    // Настраиваем стор для состояния ошибки
    store = mockStore({
      locations: {
        location: null,
        loading: false,
        error: 'Ошибка при загрузке локации'
      },
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser'
        }
      }
    });
    
    render(
      <Provider store={store}>
        <LocationDetailPage />
      </Provider>
    );
    
    expect(screen.getByText('Ошибка при загрузке локации')).toBeInTheDocument();
  });
  
  test('renders "Локация не найдена" when location is null', () => {
    // Настраиваем стор для отсутствия локации
    store = mockStore({
      locations: {
        location: null,
        loading: false,
        error: null
      },
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser'
        }
      }
    });
    
    render(
      <Provider store={store}>
        <LocationDetailPage />
      </Provider>
    );
    
    expect(screen.getByText('Локация не найдена')).toBeInTheDocument();
  });
  
  test('renders location details correctly for owner', () => {
    render(
      <Provider store={store}>
        <LocationDetailPage />
      </Provider>
    );
    
    // Проверяем отображение деталей локации
    expect(screen.getByText('Тестовая локация')).toBeInTheDocument();
    expect(screen.getByText('Подробное описание тестовой локации')).toBeInTheDocument();
    
    // Проверяем, что адрес содержится в документе
    const addressElements = screen.getAllByText((content, element) => {
      return element.textContent.includes('Тестовый адрес');
    });
    expect(addressElements.length).toBeGreaterThan(0);
    
    // Проверяем наличие имени пользователя
    const usernameElements = screen.getAllByText((content, element) => {
      return element.textContent.includes('testuser');
    });
    expect(usernameElements.length).toBeGreaterThan(0);
    
    // Проверяем наличие карты
    expect(screen.getByTestId('map')).toBeInTheDocument();
    
    // Проверяем наличие кнопок редактирования и удаления, используя содержимое кнопок
    const editButton = screen.getByRole('button', { name: /Редактировать/i });
    expect(editButton).toBeInTheDocument();
    
    const deleteButton = screen.getByRole('button', { name: /Удалить/i });
    expect(deleteButton).toBeInTheDocument();
  });
  
  test('does not show edit/delete buttons for non-owners', () => {
    // Настраиваем стор для пользователя, не являющегося владельцем
    store = mockStore({
      locations: {
        location: mockLocation,
        loading: false,
        error: null
      },
      auth: {
        isAuthenticated: true,
        user: {
          id: 2, // Другой пользователь
          username: 'otheruser'
        }
      }
    });
    
    render(
      <Provider store={store}>
        <LocationDetailPage />
      </Provider>
    );
    
    // Проверяем отображение деталей локации
    expect(screen.getByText('Тестовая локация')).toBeInTheDocument();
    
    // Проверяем отсутствие кнопок редактирования и удаления
    expect(screen.queryByRole('button', { name: /Редактировать/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Удалить/i })).not.toBeInTheDocument();
  });
  
  test('shows login prompt for unauthenticated users', () => {
    // Настраиваем стор для неаутентифицированного пользователя
    store = mockStore({
      locations: {
        location: mockLocation,
        loading: false,
        error: null
      },
      auth: {
        isAuthenticated: false,
        user: null
      }
    });
    
    render(
      <Provider store={store}>
        <LocationDetailPage />
      </Provider>
    );
    
    // Проверяем отображение деталей локации
    expect(screen.getByText('Тестовая локация')).toBeInTheDocument();
    
    // Проверяем наличие приглашения войти
    const loginLinks = screen.getAllByText(/Войдите/i);
    expect(loginLinks.length).toBeGreaterThan(0);
    
    // Проверяем наличие кнопки "В избранное"
    expect(screen.getByRole('button', { name: /В избранное/i })).toBeInTheDocument();
  });
});
