// src/redux/__tests__/locationSlice.test.js - ОБНОВЛЯЕМ initialState
import locationReducer, {
  clearLocation,
  setFilters,
  clearFilters,
  setCurrentPage,
  setTotalPages,
  clearError,
  fetchLocations,
  fetchLocationById,
  createLocation,
  updateLocation // ДОБАВЛЯЕМ новый импорт
} from '../slices/locationSlice';

// ИСПРАВЛЕНИЕ: Обновляем initialState с новыми полями
const initialState = {
  categories: [],
  error: null,
  loading: false,
  location: null,
  locations: [],
  filters: {
    search: '',
    category_id: '',
    best_time_of_day: '',
    best_season: '',
    accessibility: '',
    difficulty_level: '',
    permission_required: ''
  },
  currentPage: 1,
  totalPages: 1,
  creating: false,
  createError: null,
  updating: false,    // ДОБАВЛЯЕМ новое поле
  updateError: null   // ДОБАВЛЯЕМ новое поле
};

describe('location reducer', () => {
  test('should return the initial state', () => {
    expect(locationReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle clearLocation', () => {
    const previousState = { ...initialState, location: { id: 1, name: 'Test' } };
    expect(locationReducer(previousState, clearLocation())).toEqual({
      ...previousState,
      location: null
    });
  });

  test('should handle setFilters', () => {
    const filters = { search: 'test', category_id: '1' };
    const actual = locationReducer(initialState, setFilters(filters));
    expect(actual.filters).toEqual({
      ...initialState.filters,
      ...filters
    });
  });

  test('should handle clearFilters', () => {
    const previousState = {
      ...initialState,
      filters: { search: 'test', category_id: '1' }
    };
    expect(locationReducer(previousState, clearFilters())).toEqual({
      ...previousState,
      filters: initialState.filters
    });
  });

  test('should handle setCurrentPage', () => {
    const actual = locationReducer(initialState, setCurrentPage(2));
    expect(actual.currentPage).toEqual(2);
  });

  test('should handle setTotalPages', () => {
    const actual = locationReducer(initialState, setTotalPages(5));
    expect(actual.totalPages).toEqual(5);
  });

  test('should handle clearError', () => {
    const previousState = {
      ...initialState,
      error: 'Some error',
      createError: 'Create error',
      updateError: 'Update error' // ДОБАВЛЯЕМ новое поле
    };
    const actual = locationReducer(previousState, clearError());
    expect(actual.error).toBeNull();
    expect(actual.createError).toBeNull();
    expect(actual.updateError).toBeNull(); // ДОБАВЛЯЕМ проверку
  });

  // Тесты для async thunks
  test('should handle fetchLocations.pending', () => {
    const action = { type: fetchLocations.pending.type };
    const actual = locationReducer(initialState, action);
    expect(actual.loading).toBe(true);
    expect(actual.error).toBeNull();
  });

  test('should handle fetchLocations.fulfilled', () => {
    const payload = {
      locations: [{ id: 1, name: 'Test Location' }],
      pagination: { pages: 3 }
    };
    const action = { type: fetchLocations.fulfilled.type, payload };
    const actual = locationReducer(initialState, action);
    expect(actual.loading).toBe(false);
    expect(actual.locations).toEqual(payload.locations);
    expect(actual.totalPages).toBe(3);
    expect(actual.error).toBeNull();
  });

  test('should handle fetchLocations.rejected', () => {
    const action = { 
      type: fetchLocations.rejected.type, 
      payload: 'Fetch error' 
    };
    const actual = locationReducer(initialState, action);
    expect(actual.loading).toBe(false);
    expect(actual.error).toBe('Fetch error');
    expect(actual.locations).toEqual([]);
  });

  test('should handle createLocation.pending', () => {
    const action = { type: createLocation.pending.type };
    const actual = locationReducer(initialState, action);
    expect(actual.creating).toBe(true);
    expect(actual.createError).toBeNull();
  });

  test('should handle createLocation.fulfilled', () => {
    const newLocation = { id: 2, name: 'New Location' };
    const action = { type: createLocation.fulfilled.type, payload: newLocation };
    const actual = locationReducer(initialState, action);
    expect(actual.creating).toBe(false);
    expect(actual.locations).toContain(newLocation);
    expect(actual.createError).toBeNull();
  });

  test('should handle createLocation.rejected', () => {
    const action = { 
      type: createLocation.rejected.type, 
      payload: 'Create error' 
    };
    const actual = locationReducer(initialState, action);
    expect(actual.creating).toBe(false);
    expect(actual.createError).toBe('Create error');
  });

  // ДОБАВЛЯЕМ: Тесты для updateLocation
  test('should handle updateLocation.pending', () => {
    const action = { type: updateLocation.pending.type };
    const actual = locationReducer(initialState, action);
    expect(actual.updating).toBe(true);
    expect(actual.updateError).toBeNull();
  });

  test('should handle updateLocation.fulfilled', () => {
    const existingLocation = { id: 1, name: 'Old Name' };
    const updatedLocation = { id: 1, name: 'New Name' };
    const previousState = {
      ...initialState,
      locations: [existingLocation],
      location: existingLocation
    };
    
    const action = { type: updateLocation.fulfilled.type, payload: updatedLocation };
    const actual = locationReducer(previousState, action);
    
    expect(actual.updating).toBe(false);
    expect(actual.updateError).toBeNull();
    expect(actual.locations[0]).toEqual(updatedLocation);
    expect(actual.location).toEqual(updatedLocation);
  });

  test('should handle updateLocation.rejected', () => {
    const action = { 
      type: updateLocation.rejected.type, 
      payload: 'Update error' 
    };
    const actual = locationReducer(initialState, action);
    expect(actual.updating).toBe(false);
    expect(actual.updateError).toBe('Update error');
  });
});
