// src/components/layout/__tests__/Header.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import authReducer from '../../../redux/slices/authSlice';

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaMapMarkerAlt: () => <span>FaMapMarkerAlt</span>,
  FaHeart: () => <span>FaHeart</span>,
  FaUser: () => <span>FaUser</span>,
  FaSearch: () => <span>FaSearch</span>,
  FaSignOutAlt: () => <span>FaSignOutAlt</span>,
  FaSignInAlt: () => <span>FaSignInAlt</span>,
  FaUserPlus: () => <span>FaUserPlus</span>,
  FaCog: () => <span>FaCog</span>
}));

// Mock authService
jest.mock('../../../services/authService', () => ({
  logout: jest.fn(),
}));

describe('Header Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  test('renders logo and navigation links when user is not authenticated', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем основные элементы
    expect(screen.getByText(/Фото Локации/i)).toBeInTheDocument();
    expect(screen.getByText(/Главная/i)).toBeInTheDocument();
    
    // ИСПРАВЛЕНИЕ: Используем getAllByText для множественных элементов
    const locationsLinks = screen.getAllByText(/Локации/i);
    expect(locationsLinks.length).toBeGreaterThanOrEqual(1);
    
    expect(screen.getByText(/Поиск поблизости/i)).toBeInTheDocument();
    expect(screen.getByText(/Вход/i)).toBeInTheDocument();
    expect(screen.getByText(/Регистрация/i)).toBeInTheDocument();

    // Проверяем, что "Мои разделы" НЕ отображается для неавторизованных
    expect(screen.queryByText(/Мои разделы/i)).not.toBeInTheDocument();
  });

  test('renders user profile link when user is authenticated', () => {
    // Устанавливаем состояние авторизованного пользователя
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        token: 'fake-token'
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем наличие имени пользователя
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    
    // Проверяем наличие раздела "Мои разделы"
    expect(screen.getByText(/Мои разделы/i)).toBeInTheDocument();
    
    // Проверяем, что кнопки входа/регистрации НЕ отображаются
    expect(screen.queryByText(/^Вход$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Регистрация$/)).not.toBeInTheDocument();
  });

  test('renders profile dropdown when user is authenticated', () => {
    // Устанавливаем состояние авторизованного пользователя
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        token: 'fake-token'
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Кликаем на dropdown профиля
    const profileDropdown = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(profileDropdown);

    // Проверяем элементы dropdown меню
    expect(screen.getByText(/Профиль/i)).toBeInTheDocument();
    expect(screen.getByText(/Избранное/i)).toBeInTheDocument();
    expect(screen.getByText(/Добавить локацию/i)).toBeInTheDocument();
    expect(screen.getByText(/Выйти/i)).toBeInTheDocument();
  });

  test('calls logout function when logout button is clicked', () => {
    const authService = require('../../../services/authService');
    
    // Устанавливаем состояние авторизованного пользователя
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        token: 'fake-token'
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Открываем dropdown
    const profileDropdown = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(profileDropdown);

    // Кликаем на кнопку выхода
    const logoutButton = screen.getByText(/Выйти/i);
    fireEvent.click(logoutButton);

    // Проверяем, что функция logout была вызвана
    expect(authService.logout).toHaveBeenCalled();
  });

  test('shows admin badge for admin users', () => {
    // Устанавливаем состояние админа
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
        token: 'fake-token'
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // ИСПРАВЛЕНИЕ: Используем getAllByText для Admin badge
    const adminElements = screen.getAllByText(/Admin/i);
    // Проверяем, что есть элемент с классом badge (это и есть наш badge)
    const adminBadge = adminElements.find(element => 
      element.classList.contains('badge')
    );
    expect(adminBadge).toBeInTheDocument();
  });
});
