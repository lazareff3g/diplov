// client/src/redux/slices/locationSlice.js - ДОБАВЛЯЕМ НЕДОСТАЮЩУЮ ФУНКЦИЮ
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService from '../../services/locationService';

// Существующие thunks...
export const fetchLocations = createAsyncThunk(
  'locations/fetchLocations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await locationService.getLocations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  'locations/fetchLocationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.getLocationById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (locationData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }
      
      const response = await fetch('http://localhost:5000/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locationData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return data.location || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ДОБАВЛЯЕМ: Недостающий updateLocation thunk
export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      console.log('🔄 Redux: Обновление локации:', { id, data });
      
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }
      
      const response = await fetch(`http://localhost:5000/api/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      console.log('📡 Ответ сервера на обновление:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка обновления:', errorText);
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }
      
      const updatedLocation = await response.json();
      console.log('✅ Локация обновлена:', updatedLocation);
      
      return updatedLocation;
    } catch (error) {
      console.error('❌ Ошибка в updateLocation thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

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
  updating: false, // ДОБАВЛЯЕМ: состояние для обновления
  updateError: null
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    clearLocation: (state) => {
      state.location = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null; // ДОБАВЛЯЕМ: очистка ошибок обновления
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchLocations
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload.locations || action.payload;
        state.totalPages = action.payload.pagination?.pages || 1;
        state.error = null;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.locations = [];
      })
      
      // Обработка fetchLocationById
      .addCase(fetchLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.location = action.payload;
        state.error = null;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Обработка createLocation
      .addCase(createLocation.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.creating = false;
        state.createError = null;
        state.locations.unshift(action.payload);
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || action.error.message;
      })
      
      // ДОБАВЛЯЕМ: Обработка updateLocation
      .addCase(updateLocation.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        console.log('⏳ Redux: Обновление локации началось...');
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.updating = false;
        state.updateError = null;
        
        // Обновляем локацию в списке
        const index = state.locations.findIndex(loc => loc.id === action.payload.id);
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
        
        // Обновляем текущую локацию если она загружена
        if (state.location && state.location.id === action.payload.id) {
          state.location = action.payload;
        }
        
        console.log('✅ Redux: Локация успешно обновлена в состоянии');
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || action.error.message;
        console.error('❌ Redux: Ошибка обновления локации:', action.payload);
      });
  }
});

export const { 
  clearLocation, 
  setFilters, 
  clearFilters,
  setCurrentPage,
  setTotalPages,
  clearError
} = locationSlice.actions;

export default locationSlice.reducer;
