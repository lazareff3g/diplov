// client/src/App.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С ИНИЦИАЛИЗАЦИЕЙ
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import { setUser, setCredentials } from './redux/slices/authSlice';

// Импорт компонентов макета
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Импорт страниц
import HomePage from './pages/HomePage';
import LocationsPage from './pages/LocationsPage';
import LocationDetailPage from './pages/LocationDetailPage';
import AddLocationPage from './pages/AddLocationPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import NearbyLocationsPage from './pages/NearbyLocationsPage';
import EditLocationPage from './pages/EditLocationPage';

// Импорт компонента для защищенных маршрутов
import PrivateRoute from './components/common/PrivateRoute';

// Импорт стилей Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';

// ИСПРАВЛЕНИЕ: Компонент для инициализации авторизации
const AuthInitializer = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('🔄 Инициализация авторизации...');
        console.log('Token:', !!token);
        console.log('User data:', !!userData);
        console.log('Current user in Redux:', !!user);
        console.log('Is authenticated:', isAuthenticated);
        
        // Если есть токен и данные пользователя, но пользователь не загружен в Redux
        if (token && userData && !user) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('🔄 Восстанавливаем пользователя из localStorage:', parsedUser);
            
            // Проверяем сохраненное изображение профиля
            const profileImage = localStorage.getItem('profileImage');
            if (profileImage) {
              parsedUser.profile_picture = profileImage;
              parsedUser.profile_image = profileImage;
            }
            
            // Устанавливаем учетные данные
            dispatch(setCredentials({
              user: parsedUser,
              token: token
            }));
            
            console.log('✅ Пользователь восстановлен из localStorage');
          } catch (parseError) {
            console.error('❌ Ошибка парсинга данных пользователя:', parseError);
            // Очищаем поврежденные данные
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('profileImage');
          }
        } else if (!token || !userData) {
          // Если нет токена или данных пользователя, очищаем все
          console.log('🧹 Очищаем неполные данные авторизации');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('profileImage');
        }
      } catch (error) {
        console.error('❌ Ошибка при инициализации авторизации:', error);
        // Очищаем данные при ошибке
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('profileImage');
      }
    };

    initializeAuth();
  }, [dispatch, user, isAuthenticated]);

  return null;
};

// Компонент для защиты от доступа авторизованных пользователей к auth страницам
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Если пользователь авторизован, показываем главную
  if (isAuthenticated) {
    return <HomePage />;
  }
  
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <AuthInitializer />
          <Header />
          <main className="container py-4">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<HomePage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/nearby" element={<NearbyLocationsPage />} />
              
              {/* Auth маршруты (только для неавторизованных) */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              
              {/* ИСПРАВЛЕНИЕ: Специфичные маршруты ПЕРЕД параметризованными */}
              <Route path="/locations/add" element={
                <PrivateRoute>
                  <AddLocationPage />
                </PrivateRoute>
              } />
              
              {/* Защищенные маршруты (только для авторизованных) */}
              <Route path="/favorites" element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              
              {/* ИСПРАВЛЕНИЕ: Параметризованные маршруты В КОНЦЕ */}
              <Route path="/locations/:id/edit" element={
                <PrivateRoute>
                  <EditLocationPage />
                </PrivateRoute>
              } />
              <Route path="/locations/:id" element={<LocationDetailPage />} />
              
              {/* 404 страница - ВСЕГДА ПОСЛЕДНЯЯ */}
              <Route path="*" element={
                <div className="text-center py-5">
                  <h1>404</h1>
                  <p>Страница не найдена</p>
                  <a href="/" className="btn btn-primary">На главную</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
