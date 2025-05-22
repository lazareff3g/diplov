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
      });
  }
});

export const { 
  clearLocation, 
  setFilters, 
  clearFilters,
  setCurrentPage,
  setTotalPages
} = locationSlice.actions;

export default locationSlice.reducer;
