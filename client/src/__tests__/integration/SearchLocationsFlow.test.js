// src/__tests__/integration/SearchLocationsFlow.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import locationReducer from '../../redux/slices/locationSlice';
import locationService from '../../services/locationService';
import SearchPage from '../../pages/SearchPage';

// Мокируем locationService
jest.mock('../../services/locationService', () => ({
  searchLocations: jest.fn(),
  getCategories: jest.fn()
}));

describe('Search Locations Flow', () => {
  let store;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    locationService.searchLocations.mockResolvedValue({
      locations: [
        {
          id: 1,
          name: 'Горное озеро',
          description: 'Красивое горное озеро',
          image_url: '/lake.jpg',
          category_name: 'Природа'
        },
        {
          id: 2,
          name: 'Лесная тропа',
          description: 'Живописная лесная тропа',
          image_url: '/forest.jpg',
          category_name: 'Природа'
        }
      ],
      totalPages: 1
    });
    
    locationService.getCategories.mockResolvedValue([
      { id: 1, name: 'Природа' },
      { id: 2, name: 'Архитектура' }
    ]);
    
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

  test('searches locations by keyword', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Вводим поисковый запрос
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'озеро' }
    });
    
    // Отправляем форму поиска
    fireEvent.click(screen.getByTestId('search-button'));
    
    // Ждем, пока загрузятся результаты поиска
    await waitFor(() => {
      expect(locationService.searchLocations).toHaveBeenCalled();
    });
    
    // Проверяем, что результаты поиска отображаются (используем getAllByText для множественных элементов)
    await waitFor(() => {
      expect(screen.getAllByText('Горное озеро')[0]).toBeInTheDocument();
    });
  });

  test('filters locations by category', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Открываем панель фильтров
    fireEvent.click(screen.getByTestId('toggle-filters-button'));
    
    // Ждем, пока загрузятся категории
    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });
    
    // Выбираем категорию "Природа"
    fireEvent.change(screen.getByTestId('category-filter'), {
      target: { value: '1' }
    });
    
    // Ждем, пока загрузятся результаты фильтрации
    await waitFor(() => {
      expect(locationService.searchLocations).toHaveBeenCalled();
    });
    
    // Проверяем, что результаты фильтрации отображаются
    await waitFor(() => {
      expect(screen.getAllByText('Горное озеро')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Лесная тропа')[0]).toBeInTheDocument();
    });
  });

  test('clears filters', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SearchPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Открываем панель фильтров
    fireEvent.click(screen.getByTestId('toggle-filters-button'));
    
    // Ждем, пока загрузятся фильтры
    await waitFor(() => {
      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
    });
    
    // Нажимаем кнопку сброса фильтров
    fireEvent.click(screen.getByTestId('clear-filters-button'));
    
    // Ждем, пока загрузятся результаты
    await waitFor(() => {
      expect(locationService.searchLocations).toHaveBeenCalled();
    });
  });
});
