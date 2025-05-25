// client/src/redux/slices/authSlice.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С ИНИЦИАЛИЗАЦИЕЙ
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ИСПРАВЛЕНИЕ: Функция для безопасного получения данных из localStorage
const getInitialUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Ошибка парсинга данных пользователя:', error);
    localStorage.removeItem('user'); // Удаляем поврежденные данные
    return null;
  }
};

const getInitialToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('❌ Ошибка получения токена:', error);
    return null;
  }
};

// Асинхронные действия с createAsyncThunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при регистрации'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при входе'
      );
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при получении профиля'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при обновлении профиля'
      );
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profileImage');
      delete api.defaults.headers.common['Authorization'];
      
      return rejectWithValue(
        error.response?.data?.message || 'Токен недействителен'
      );
    }
  }
);

// ИСПРАВЛЕНИЕ: Инициализация состояния с данными из localStorage
const initialState = {
  user: getInitialUser(), // Получаем пользователя из localStorage
  token: getInitialToken(), // Получаем токен из localStorage
  isAuthenticated: !!(getInitialToken() && getInitialUser()), // Проверяем и токен и пользователя
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
      state.user = action.payload.user || action.payload;
      state.token = action.payload.token;
      state.error = null;
      
      // ИСПРАВЛЕНИЕ: Сохраняем данные в localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      
      if (action.payload.user?.profile_picture || action.payload.profile_picture) {
        localStorage.setItem('profileImage', action.payload.user?.profile_picture || action.payload.profile_picture);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      
      // Очищаем localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profileImage');
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user || action.payload;
      state.token = action.payload.token;
      state.error = null;
      
      // ИСПРАВЛЕНИЕ: Сохраняем данные в localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      
      if (action.payload.user?.profile_picture || action.payload.profile_picture) {
        localStorage.setItem('profileImage', action.payload.user?.profile_picture || action.payload.profile_picture);
      }
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      
      // ИСПРАВЛЕНИЕ: Полная очистка localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profileImage');
      delete api.defaults.headers.common['Authorization'];
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      
      // Обновляем localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
      
      if (action.payload.profile_picture) {
        localStorage.setItem('profileImage', action.payload.profile_picture);
      }
    },
    // ИСПРАВЛЕНИЕ: Улучшенный updateUser action
    updateUser: (state, action) => {
      console.log('🔄 Redux: Обновляем пользователя:', action.payload);
      state.user = { ...state.user, ...action.payload };
      
      // ИСПРАВЛЕНИЕ: Сохраняем обновленного пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
      
      // Сохраняем аватарку в localStorage если она есть
      if (action.payload.profile_image || action.payload.profile_picture) {
        const imageUrl = action.payload.profile_image || action.payload.profile_picture;
        localStorage.setItem('profileImage', imageUrl);
      }
      
      console.log('✅ Redux: Пользователь обновлен:', state.user);
    },
    // ДОБАВЛЕНИЕ: Action для установки учетных данных
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Сохраняем в localStorage
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    // ДОБАВЛЕНИЕ: Action для установки пользователя
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      // Register с async thunk
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.user?.profile_picture) {
          localStorage.setItem('profileImage', action.payload.user.profile_picture);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login с async thunk
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.user?.profile_picture) {
          localStorage.setItem('profileImage', action.payload.user.profile_picture);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        // Очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('profileImage');
        delete api.defaults.headers.common['Authorization'];
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.user?.profile_picture) {
          localStorage.setItem('profileImage', action.payload.user.profile_picture);
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify Token
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        // Очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('profileImage');
      });
  }
});

// ИСПРАВЛЕНИЕ: Добавляем все actions в экспорт
export const { 
  loginStart, loginSuccess, loginFailure, 
  registerStart, registerSuccess, registerFailure, 
  logout, clearError, updateUserProfile, setCredentials,
  updateUser, setUser // ДОБАВЛЯЕМ НОВЫЕ ACTIONS
} = authSlice.actions;

export default authSlice.reducer;
