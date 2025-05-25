// client/src/components/auth/Register.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { registerUser, clearError } from '../../redux/slices/authSlice';

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
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    if (password.length < 6) {
      return 'Пароль должен содержать не менее 6 символов';
    }
    
    if (password !== confirmPassword) {
      return 'Пароли не совпадают';
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return 'Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, подчеркивания)';
    }
    
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    const validationError = validateForm();
    if (form.checkValidity() === false || validationError) {
      e.stopPropagation();
      setValidated(true);
      
      if (validationError) {
        console.error('Validation error:', validationError);
      }
      return;
    }
    
    try {
      const result = await dispatch(registerUser({ 
        username: username.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      }));
      
      if (registerUser.fulfilled.match(result)) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 6;
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2 className="text-center mb-4">📝 Регистрация</h2>
        </div>
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
        
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
              isInvalid={validated && (!username || !usernameValid)}
              isValid={validated && username && usernameValid}
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, подчеркивания)
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid">
              Отлично!
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
              size="lg"
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
              placeholder="Введите пароль (минимум 6 символов)"
              minLength="6"
              isInvalid={validated && !passwordValid}
              isValid={validated && passwordValid}
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              Пароль должен содержать минимум 6 символов.
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid">
              Пароль подходит!
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Подтверждение пароля</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              placeholder="Подтвердите пароль"
              isInvalid={validated && (!passwordsMatch || !confirmPassword)}
              isValid={validated && passwordsMatch && confirmPassword}
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              Пароли не совпадают.
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid">
              Пароли совпадают!
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mb-3"
            disabled={loading || !passwordsMatch || !passwordValid || !usernameValid}
            size="lg"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Регистрация...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </Button>
        </Form>
        
        <div className="text-center mt-3">
          Уже есть аккаунт? <Link to="/login" className="text-decoration-none">Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
