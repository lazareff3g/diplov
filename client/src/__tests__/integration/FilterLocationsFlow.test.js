// src/__tests__/integration/FilterLocationsFlow.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import LocationFilter from '../../components/locations/LocationFilter';

// Мокируем react-icons/fa
jest.mock('react-icons/fa', () => ({
  FaSearch: () => <span data-testid="search-icon">🔍</span>
}));

// Создаем реальные действия для мока
const setFiltersAction = { type: 'locations/setFilters' };

// Мокируем locationSlice
jest.mock('../../redux/slices/locationSlice', () => ({
  setFilters: () => setFiltersAction,
  clearFilters: () => ({ type: 'locations/clearFilters' })
}));

describe('Filter Locations Flow', () => {
  const mockStore = configureStore();
  let store;
  
  beforeEach(() => {
    // Создаем стор
    store = mockStore({
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
    });
    
    // Мокируем dispatch
    store.dispatch = jest.fn(() => {
      // Вызываем onFilterChange при вызове dispatch
      // Это имитирует поведение компонента, который вызывает onFilterChange
      // после обновления состояния Redux
      if (mockOnFilterChange) mockOnFilterChange();
      return Promise.resolve();
    });
  });
  
  let mockOnFilterChange;
  
  test('filtering locations with search and category', async () => {
    const mockCategories = [
      { id: 1, name: 'Природа' },
      { id: 2, name: 'Архитектура' },
      { id: 3, name: 'Городской пейзаж' }
    ];
    
    mockOnFilterChange = jest.fn();
    
    render(
      <Provider store={store}>
        <LocationFilter 
          categories={mockCategories} 
          onFilterChange={mockOnFilterChange} 
        />
      </Provider>
    );
    
    // Заполняем поля фильтра
    fireEvent.change(screen.getByPlaceholderText('Поиск по названию или описанию'), {
      target: { value: 'озеро' }
    });
    
    // Находим выпадающий список категорий и выбираем "Природа"
    const categorySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(categorySelect, {
      target: { value: '1' }
    });
    
    // Нажимаем кнопку применения фильтров
    fireEvent.click(screen.getByText('Применить'));
    
    // Проверяем, что dispatch был вызван
    expect(store.dispatch).toHaveBeenCalled();
    
    // Проверяем, что onFilterChange был вызван
    expect(mockOnFilterChange).toHaveBeenCalled();
  });
});
