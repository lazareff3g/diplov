// client/src/components/layout/Header.js - ПОЛНАЯ ВОССТАНОВЛЕННАЯ ВЕРСИЯ
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Nav, Container, Button, NavDropdown, Badge } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaHeart, 
  FaUser, 
  FaSearch, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus, 
  FaCog 
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/authService';

const Header = () => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Все равно выходим даже при ошибке
      dispatch(logout());
      navigate('/');
    }
  };
  
  // Получаем изображение профиля
  const profileImage = localStorage.getItem('profileImage') || user?.profile_picture;
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          📸 Фото Локации
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              🏠 Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/locations">
              📍 Локации
            </Nav.Link>
            <Nav.Link as={Link} to="/nearby">
              <FaSearch className="me-1" /> Поиск поблизости
            </Nav.Link>
            
            {isAuthenticated && (
              <NavDropdown 
                title={
                  <span>
                    <FaMapMarkerAlt className="me-1" /> Мои разделы
                  </span>
                } 
                id="user-nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/locations/add">
                  <FaMapMarkerAlt className="me-2 text-primary" /> Добавить локацию
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/favorites">
                  <FaHeart className="me-2 text-danger" /> Избранное
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2 text-info" /> Мой профиль
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span className="d-flex align-items-center">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="rounded-circle me-2"
                        style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                      />
                    ) : (
                      <FaUser className="me-2" />
                    )}
                    <span className="d-none d-md-inline">
                      {user?.username || 'Пользователь'}
                    </span>
                    {user?.role === 'admin' && (
                      <Badge bg="warning" className="ms-2">Admin</Badge>
                    )}
                  </span>
                } 
                id="profile-nav-dropdown"
                align="end"
              >
                <NavDropdown.Header>
                  <div className="text-center">
                    <strong>{user?.username}</strong>
                    <br />
                    <small className="text-muted">{user?.email}</small>
                  </div>
                </NavDropdown.Header>
                <NavDropdown.Divider />
                
                <NavDropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2 text-primary" /> Профиль
                </NavDropdown.Item>
                
                <NavDropdown.Item as={Link} to="/favorites">
                  <FaHeart className="me-2 text-danger" /> Избранное
                </NavDropdown.Item>
                
                <NavDropdown.Item as={Link} to="/locations/add">
                  <FaMapMarkerAlt className="me-2 text-success" /> Добавить локацию
                </NavDropdown.Item>
                
                <NavDropdown.Divider />
                
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" /> Выйти
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/login" className="me-2">
                  <FaSignInAlt className="me-1" /> Вход
                </Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="outline-light" 
                  size="sm"
                  className="d-flex align-items-center"
                >
                  <FaUserPlus className="me-1" /> Регистрация
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
