import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from '../Header';

// Мокаем react-icons/fa
jest.mock('react-icons/fa', () => ({
  FaMapMarkerAlt: () => 'FaMapMarkerAlt',
  FaHeart: () => 'FaHeart',
  FaUser: () => 'FaUser',
  FaSearch: () => 'FaSearch'
}));

// Создаем мок-стор
const mockStore = configureStore([]);

describe('Header Component', () => {
  test('renders logo and navigation links when user is not authenticated', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем наличие логотипа
    const logoLink = screen.getByText(/Фото Локации/i);
    expect(logoLink).toBeInTheDocument();
    expect(logoLink.closest('a')).toHaveAttribute('href', '/');
    
    // Проверяем наличие ссылок навигации
    const navLinks = screen.getAllByRole('link');
    
    // Находим ссылку "Главная"
    const homeLink = navLinks.find(link => link.textContent.includes('Главная'));
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    
    // Находим ссылку "Локации"
    const locationsLink = navLinks.find(link => 
      link.textContent === 'Локации' && link.getAttribute('href') === '/locations'
    );
    expect(locationsLink).toBeInTheDocument();
    
    // Проверяем наличие ссылок входа и регистрации
    expect(screen.getByText(/Вход/i)).toBeInTheDocument();
    expect(screen.getByText(/Регистрация/i)).toBeInTheDocument();
  });

  test('renders user profile link when user is authenticated', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          username: 'testuser',
          profile_picture: null
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем наличие имени пользователя и кнопки выхода
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    expect(screen.getByText(/Выход/i)).toBeInTheDocument();
    
    // Проверяем наличие раздела "Мои разделы"
    expect(screen.getByText(/Мои разделы/i)).toBeInTheDocument();
  });
});
