import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  locations: [],
  location: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  filters: {}
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    getLocationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getLocationsSuccess: (state, action) => {
      state.loading = false;
      state.locations = action.payload.locations || action.payload;
      state.totalPages = action.payload.totalPages || 1;
      state.currentPage = action.payload.currentPage || 1;
    },
    getLocationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getLocationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getLocationSuccess: (state, action) => {
      state.loading = false;
      state.location = action.payload;
    },
    getLocationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createLocationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createLocationSuccess: (state, action) => {
      state.loading = false;
      state.locations = [action.payload, ...state.locations];
    },
    createLocationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    }
  }
});

export const {
  getLocationsStart,
  getLocationsSuccess,
  getLocationsFailure,
  getLocationStart,
  getLocationSuccess,
  getLocationFailure,
  createLocationStart,
  createLocationSuccess,
  createLocationFailure,
  setFilters,
  clearFilters
} = locationSlice.actions;

export default locationSlice.reducer;
