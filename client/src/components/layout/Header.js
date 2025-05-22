import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { FaMapMarkerAlt, FaHeart, FaUser, FaSearch } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/authService';

const Header = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Фото Локации</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/locations">Локации</Nav.Link>
            <Nav.Link as={Link} to="/nearby">
              <FaSearch className="me-1" /> Поиск поблизости
            </Nav.Link>
            {isAuthenticated && (
              <NavDropdown title="Мои разделы" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/locations/add">
                  <FaMapMarkerAlt className="me-2" /> Добавить локацию
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/favorites">
                  <FaHeart className="me-2" /> Избранное
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/profile">
                  <FaUser className="me-1" /> {user?.username || 'Профиль'}
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Выход
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
