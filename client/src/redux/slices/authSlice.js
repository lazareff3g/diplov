import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      // Сохраняем URL изображения профиля в localStorage
      if (action.payload && action.payload.profile_picture) {
        localStorage.setItem('profileImage', action.payload.profile_picture);
      } else {
        localStorage.removeItem('profileImage');
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
      localStorage.removeItem('profileImage');
    },
    // Добавляем действия для регистрации
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      // Сохраняем URL изображения профиля в localStorage
      if (action.payload && action.payload.profile_picture) {
        localStorage.setItem('profileImage', action.payload.profile_picture);
      } else {
        localStorage.removeItem('profileImage');
      }
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem('profileImage');
    },
    clearError: (state) => {
      state.error = null;
    },
    // Добавляем редьюсер для обновления профиля пользователя
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (action.payload.profile_picture) {
        localStorage.setItem('profileImage', action.payload.profile_picture);
      }
    }
  }
});

export const { 
  loginStart, loginSuccess, loginFailure, 
  registerStart, registerSuccess, registerFailure, 
  logout, clearError, updateUserProfile 
} = authSlice.actions;
export default authSlice.reducer;
