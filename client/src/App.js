import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './redux/store';
import { loginSuccess } from './redux/slices/authSlice';
import authService from './services/authService';

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

// Импорт стилей Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';

// Компонент для инициализации авторизации
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Проверяем, есть ли токен в localStorage
        if (authService.isAuthenticated()) {
          // Получаем данные пользователя
          const userData = await authService.getCurrentUser();
          if (userData) {
            // Устанавливаем пользователя в состояние Redux
            dispatch(loginSuccess(userData));
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
        // Если возникла ошибка, выходим из системы
        authService.logout();
      }
    };

    loadUser();
  }, [dispatch]);

  return null;
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
              <Route path="/" element={<HomePage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/locations/:id" element={<LocationDetailPage />} />
              <Route path="/add-location" element={<AddLocationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
