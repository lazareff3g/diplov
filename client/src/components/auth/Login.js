// client/src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { loginUser, clearError } from '../../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [validated, setValidated] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const { identifier, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      dispatch(clearError());
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      const result = await dispatch(loginUser({ 
        identifier: identifier.trim(), 
        password 
      }));
      
      if (loginUser.fulfilled.match(result)) {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2 className="text-center mb-4">🔐 Вход в систему</h2>
        </div>
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={onSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Имя пользователя или Email</Form.Label>
            <Form.Control
              type="text"
              name="identifier"
              value={identifier}
              onChange={onChange}
              required
              placeholder="Введите имя пользователя или email"
              autoComplete="username"
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              Пожалуйста, введите имя пользователя или email.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Введите пароль"
              autoComplete="current-password"
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              Пожалуйста, введите пароль.
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mb-3"
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </Button>
        </Form>
        
        <div className="text-center mt-3">
          <small className="text-muted">
            Забыли пароль? <Link to="/forgot-password" className="text-decoration-none">Восстановить</Link>
          </small>
        </div>
        
        <div className="text-center mt-3">
          Нет аккаунта? <Link to="/register" className="text-decoration-none">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
