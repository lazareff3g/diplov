import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService from '../../services/locationService';

// Асинхронные действия (thunks)
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

// Добавляем недостающий thunk для создания локаций
export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await locationService.createLocation(locationData);
      return response;
    } catch (error) {
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
  createError: null
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
    
    // Добавляем недостающие синхронные actions
    getLocationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getLocationsSuccess: (state, action) => {
      state.loading = false;
      state.locations = action.payload.locations || [];
      state.totalPages = action.payload.totalPages || 1;
      state.error = null;
    },
    getLocationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.locations = [];
    },
    
    createLocationStart: (state) => {
      state.creating = true;
      state.createError = null;
    },
    createLocationSuccess: (state, action) => {
      state.creating = false;
      state.locations.push(action.payload);
      state.createError = null;
    },
    createLocationFailure: (state, action) => {
      state.creating = false;
      state.createError = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
      state.createError = null;
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
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Обработка fetchLocationById
      .addCase(fetchLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.location = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Обработка createLocation
      .addCase(createLocation.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.creating = false;
        state.locations.push(action.payload);
        state.createError = null;
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      });
  }
});

export const { 
  clearLocation, 
  setFilters, 
  clearFilters,
  setCurrentPage,
  setTotalPages,
  getLocationsStart,
  getLocationsSuccess,
  getLocationsFailure,
  createLocationStart,
  createLocationSuccess,
  createLocationFailure,
  clearError
} = locationSlice.actions;

export default locationSlice.reducer;
