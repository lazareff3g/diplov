// src/pages/__tests__/SearchPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import locationReducer from '../../redux/slices/locationSlice';
import SearchPage from '../SearchPage';

// Мокируем locationService
jest.mock('../../services/locationService', () => ({
  searchLocations: jest.fn(),
  getCategories: jest.fn()
}));

// Мокируем LocationList компонент для упрощения тестов
jest.mock('../../components/locations/LocationList', () => {
  return function MockLocationList({ locations, onPageChange }) {
    return (
      <div data-testid="location-list">
        {locations.map(location => (
          <div key={location.id}>{location.name}</div>
        ))}
      </div>
    );
  };
});

// Импортируем мокированный модуль
import locationService from '../../services/locationService';

describe('SearchPage', () => {
  let store;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    store = configureStore({
      reducer: {
        locations: locationReducer
      },
      preloadedState: {
        locations: {
          filters: {
            search: '',
            category_id: '',
            best_time_of_day: '',
            best_season: '',
            accessibility: '',
            difficulty_level: '',
            permission_required: ''
          }
        }
      }
    });
  });

  test('renders search form', () => {
    // Настраиваем моки с быстрым резолвом
    locationService.searchLocations.mockResolvedValue({
      locations: [],
      totalPages: 0
    });
    locationService.getCategories.mockResolvedValue([]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Поиск локаций')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-filters-button')).toBeInTheDocument();
  });

  test('shows loading spinner initially', () => {
    // Настраиваем моки с задержкой согласно [5]
    locationService.searchLocations.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          locations: [],
          totalPages: 0
        }), 100)
      )
    );
    locationService.getCategories.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve([]), 50)
      )
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Проверяем, что спиннер загрузки отображается
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Поиск локаций...')).toBeInTheDocument();
  });

  test('shows message when no results found (empty database)', async () => {
    // Настраиваем моки с быстрым резолвом
    locationService.searchLocations.mockResolvedValue({
      locations: [],
      totalPages: 0
    });
    locationService.getCategories.mockResolvedValue([]);
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Согласно [4], ждем завершения fetch
    await waitFor(() => {
      expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Локации не найдены')).toBeInTheDocument();
  });

  test('toggles filters panel', async () => {
    locationService.searchLocations.mockResolvedValue({
      locations: [],
      totalPages: 0
    });
    locationService.getCategories.mockResolvedValue([]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Ждем завершения загрузки согласно [4]
    await waitFor(() => {
      expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
    });
    
    // Изначально панель фильтров скрыта
    expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();
    
    // Нажимаем кнопку фильтров
    fireEvent.click(screen.getByTestId('toggle-filters-button'));
    
    // Проверяем, что панель фильтров отображается
    expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
  });
});
