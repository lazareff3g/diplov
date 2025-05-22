import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const location = useLocation();

  // Если проверка авторизации еще идет, можно показать индикатор загрузки
  if (loading) {
    return <div className="text-center p-5">Загрузка...</div>;
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  // и сохраняем текущий путь для возврата после авторизации
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Если пользователь авторизован, отображаем защищенный компонент
  return children;
};

export default PrivateRoute;
