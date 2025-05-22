import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PrivateRoute from '../PrivateRoute';

// Мокируем react-router-dom
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => <div>{children}</div>,
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Redirecting...</div>,
  Outlet: () => <div>Outlet</div>,
  useLocation: () => ({ pathname: '/test' }),
  useNavigate: () => jest.fn()
}));

describe('PrivateRoute Component', () => {
  const mockStore = configureStore();
  let store;
  
  // Компонент для тестирования
  const TestComponent = () => <div>Protected Content</div>;
  
  test('renders child component when user is authenticated', () => {
    // Создаем стор с аутентифицированным пользователем
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { id: 1, username: 'testuser' },
        loading: false
      }
    });
    
    render(
      <Provider store={store}>
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      </Provider>
    );
    
    // Проверяем, что защищенный контент отображается
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  test('redirects to login when user is not authenticated', () => {
    // Создаем стор с неаутентифицированным пользователем
    store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false
      }
    });
    
    render(
      <Provider store={store}>
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      </Provider>
    );
    
    // Проверяем, что происходит перенаправление на страницу входа
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/login');
  });
});
