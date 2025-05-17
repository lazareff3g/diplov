import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { registerStart, registerSuccess, registerFailure, clearError } from '../../redux/slices/authSlice';
import authService from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validated, setValidated] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Если пользователь авторизован, перенаправляем на главную
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Очищаем ошибки при размонтировании компонента
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || password !== confirmPassword) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      dispatch(registerStart());
      const userData = await authService.register({ username, email, password });
      dispatch(registerSuccess(userData));
      navigate('/');
    } catch (err) {
      dispatch(registerFailure(err.response?.data?.message || 'Ошибка при регистрации'));
    }
  };

  return (
    <Card>
      <Card.Header as="h4" className="text-center">Регистрация</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form noValidate validated={validated} onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              required
              placeholder="Введите имя пользователя"
            />
            <Form.Control.Feedback type="invalid">
              Пожалуйста, введите имя пользователя.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Введите email"
            />
            <Form.Control.Feedback type="invalid">
              Пожалуйста, введите корректный email.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Введите пароль"
              minLength="6"
            />
            <Form.Control.Feedback type="invalid">
              Пароль должен содержать минимум 6 символов.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Подтверждение пароля</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              placeholder="Подтвердите пароль"
              isInvalid={validated && password !== confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              Пароли не совпадают.
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Form>
      </Card.Body>
      <Card.Footer className="text-center">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </Card.Footer>
    </Card>
  );
};

export default Register;
