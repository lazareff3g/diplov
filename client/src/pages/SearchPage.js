// src/pages/__tests__/SearchPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import locationService from '../services/locationService.js';
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
    
    // Настраиваем дефолтные моки в beforeEach
    locationService.searchLocations.mockResolvedValue({
      locations: [],
      totalPages: 0
    });
    locationService.getCategories.mockResolvedValue([]);
    
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

  test('shows message when no results found (empty database)', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Согласно [5], используем findBy для ожидания появления элемента
    const noResultsMessage = await screen.findByTestId('no-results-message', {}, { timeout: 3000 });
    expect(noResultsMessage).toBeInTheDocument();
    expect(screen.getByText('Локации не найдены')).toBeInTheDocument();
  });

  test('toggles filters panel', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Ждем завершения загрузки с помощью findBy
    await screen.findByTestId('no-results-message', {}, { timeout: 3000 });
    
    // Изначально панель фильтров скрыта
    expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();
    
    // Нажимаем кнопку фильтров
    fireEvent.click(screen.getByTestId('toggle-filters-button'));
    
    // Проверяем, что панель фильтров отображается
    expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
  });
});
