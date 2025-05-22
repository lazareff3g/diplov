// src/redux/__tests__/locationSlice.test.js
import locationReducer, {
  fetchLocations,
  fetchLocationById,
  clearLocation,
  setFilters,
  clearFilters,
  setCurrentPage,
  setTotalPages
} from '../slices/locationSlice';

describe('location reducer', () => {
  // Обновляем initialState, чтобы оно соответствовало фактическому состоянию редьюсера
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
    totalPages: 1
  };

  test('should handle initial state', () => {
    expect(locationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle getLocationsStart', () => {
    const actual = locationReducer(initialState, { type: 'locations/fetchLocations/pending' });
    expect(actual.loading).toEqual(true);
    expect(actual.error).toEqual(null);
  });

  test('should handle getLocationsSuccess', () => {
    const locations = [{ id: 1, name: 'Test' }];
    const actual = locationReducer(initialState, { 
      type: 'locations/fetchLocations/fulfilled',
      payload: locations
    });
    expect(actual.locations).toEqual(locations);
    expect(actual.loading).toEqual(false);
    expect(actual.error).toEqual(null);
  });

  test('should handle getLocationsFailure', () => {
    const error = 'Error message';
    const actual = locationReducer(initialState, { 
      type: 'locations/fetchLocations/rejected',
      error: { message: error }
    });
    expect(actual.loading).toEqual(false);
    expect(actual.error).toEqual(error);
  });

  test('should handle getLocationStart', () => {
    const actual = locationReducer(initialState, { type: 'locations/fetchLocationById/pending' });
    expect(actual.loading).toEqual(true);
    expect(actual.error).toEqual(null);
  });

  test('should handle getLocationSuccess', () => {
    const location = { id: 1, name: 'Test' };
    const actual = locationReducer(initialState, { 
      type: 'locations/fetchLocationById/fulfilled',
      payload: location
    });
    expect(actual.location).toEqual(location);
    expect(actual.loading).toEqual(false);
    expect(actual.error).toEqual(null);
  });

  test('should handle getLocationFailure', () => {
    const error = 'Error message';
    const actual = locationReducer(initialState, { 
      type: 'locations/fetchLocationById/rejected',
      error: { message: error }
    });
    expect(actual.loading).toEqual(false);
    expect(actual.error).toEqual(error);
  });

  test('should handle clearLocation', () => {
    const state = {
      ...initialState,
      location: { id: 1, name: 'Test' }
    };
    const actual = locationReducer(state, clearLocation());
    expect(actual.location).toBeNull();
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
    const state = {
      ...initialState,
      filters: {
        ...initialState.filters,
        search: 'test',
        category_id: '1'
      }
    };
    const actual = locationReducer(state, clearFilters());
    expect(actual.filters).toEqual(initialState.filters);
  });

  test('should handle setCurrentPage', () => {
    const actual = locationReducer(initialState, setCurrentPage(2));
    expect(actual.currentPage).toBe(2);
  });

  test('should handle setTotalPages', () => {
    const actual = locationReducer(initialState, setTotalPages(5));
    expect(actual.totalPages).toBe(5);
  });
});
