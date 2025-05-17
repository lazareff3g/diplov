import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alert: null,
  mapCenter: [55.751244, 37.618423], // Москва
  mapZoom: 10
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setAlert: (state, action) => {
      state.alert = action.payload;
    },
    clearAlert: (state) => {
      state.alert = null;
    },
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action) => {
      state.mapZoom = action.payload;
    }
  }
});

export const {
  setAlert,
  clearAlert,
  setMapCenter,
  setMapZoom
} = uiSlice.actions;

export default uiSlice.reducer;
