import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import authService from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { email, password } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      dispatch(loginFailure('Пожалуйста, заполните все поля'));
      return;
    }
    
    try {
      dispatch(loginStart());
      console.log('Отправка запроса авторизации с данными:', { email, password });
      const userData = await authService.login({ email, password });
      console.log('Получен ответ от сервера:', userData);
      dispatch(loginSuccess(userData));
      navigate('/');
    } catch (err) {
      console.error('Ошибка при входе:', err);
      let errorMessage = 'Ошибка при входе';
      
      if (err.response) {
        // Сервер вернул ответ с кодом ошибки
        console.error('Ответ сервера:', err.response.data);
        errorMessage = err.response.data.message || 'Неверный email или пароль';
      } else if (err.request) {
        // Запрос был отправлен, но ответ не получен
        console.error('Запрос отправлен, но ответ не получен');
        errorMessage = 'Сервер недоступен. Пожалуйста, попробуйте позже.';
      } else {
        // Произошла ошибка при настройке запроса
        console.error('Ошибка при настройке запроса:', err.message);
        errorMessage = 'Ошибка при отправке запроса';
      }
      
      dispatch(loginFailure(errorMessage));
    }
  };
  
  return (
    <Card className="auth-form">
      <Card.Header as="h4" className="text-center">Вход в систему</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Введите ваш email"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Введите ваш пароль"
              required
            />
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mt-3"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </Form>
        
        <div className="text-center mt-3">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Login;
