import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Alert, Button, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { FaUser, FaEdit, FaSave, FaCamera, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';
import LocationItem from '../components/locations/LocationItem';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [userLocations, setUserLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояние для редактирования профиля
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Загружаем локации пользователя
      const fetchUserLocations = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/locations/user/${user.id}`);
          setUserLocations(response.data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Ошибка при загрузке локаций');
          setLoading(false);
        }
      };

      fetchUserLocations();
      
      // Инициализация данных профиля
      if (user) {
        setProfileData({
          username: user.username || '',
          bio: user.bio || '',
          avatar: null
        });
        
        // Приоритет: 1) изображение из Redux, 2) изображение из localStorage, 3) дефолтное изображение
        const profileImage = user.profile_picture || localStorage.getItem('profileImage') || null;
        if (profileImage) {
          setAvatarPreview(profileImage);
        }
        
        console.log('User from Redux:', user);
        console.log('Profile image from localStorage:', localStorage.getItem('profileImage'));
        console.log('Final image URL:', profileImage);
      }
    }
  }, [isAuthenticated, navigate, user]);

  // Обработчик открытия модального окна редактирования
  const handleEditProfile = () => {
    setShowEditModal(true);
    setSaveError(null);
  };
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработчик изменения аватара
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Предпросмотр аватара
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Обработчик сохранения профиля
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('bio', profileData.bio);
      
      if (profileData.avatar) {
        formData.append('image', profileData.avatar);
      }
      
      const response = await api.post('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Проверяем успешность ответа
      if (response.data.success && response.data.imageUrl) {
        // Сохраняем URL изображения в localStorage
        localStorage.setItem('profileImage', response.data.imageUrl);
        
        console.log('Ответ сервера:', response.data);
        console.log('URL изображения:', response.data.imageUrl);
        console.log('localStorage после сохранения:', localStorage.getItem('profileImage'));
        
        // Обновление пользователя в Redux
        dispatch({
          type: 'auth/updateUserProfile',
          payload: {
            ...response.data.user,
            profile_picture: response.data.imageUrl
          }
        });
        
        // Обновляем предпросмотр аватара
        setAvatarPreview(response.data.imageUrl);
        
        setShowEditModal(false);
      } else {
        setSaveError('Не удалось обновить изображение профиля');
      }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setSaveError(err.response?.data?.message || 'Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Перенаправление произойдет в useEffect
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Профиль пользователя</h1>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="avatar-container mb-3">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Аватар пользователя" 
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUser size={50} />
                  </div>
                )}
              </div>
              
              <h3>{user.username}</h3>
              {user.role === 'admin' && (
                <Badge bg="primary" className="mb-2">Администратор</Badge>
              )}
              <p className="text-muted">{user.email}</p>
              
              {user.bio && (
                <p className="user-bio">{user.bio}</p>
              )}
            </Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Добавлено локаций:</strong> {userLocations.length}
              </ListGroup.Item>
            </ListGroup>
            <Card.Footer>
              <Button 
                variant="outline-primary" 
                onClick={handleEditProfile}
                className="w-100"
              >
                <FaEdit className="me-2" /> Редактировать профиль
              </Button>
            </Card.Footer>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Действия</Card.Title>
              <div className="d-grid gap-2">
                <Link to="/locations/add">
                  <Button variant="primary" className="w-100">
                    <FaMapMarkerAlt className="me-2" /> Добавить новую локацию
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="outline-primary" className="w-100">
                    Избранные локации
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Мои локации</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : userLocations.length === 0 ? (
                <Alert variant="warning">
                  У вас пока нет добавленных локаций.{' '}
                  <Link to="/locations/add">Добавить локацию</Link>
                </Alert>
              ) : (
                <Row>
                  {userLocations.map(location => (
                    <Col key={location.id} md={6} className="mb-4">
                      <LocationItem location={location} />
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Модальное окно редактирования профиля */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактирование профиля</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && (
            <Alert variant="danger">{saveError}</Alert>
          )}
          
          <Form>
            <div className="text-center mb-3">
              <div className="avatar-container mx-auto">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Аватар пользователя" 
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUser size={50} />
                  </div>
                )}
                
                <div className="avatar-upload">
                  <label htmlFor="avatar-input" className="avatar-upload-label">
                    <FaCamera size={20} />
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={user.email}
                disabled
              />
              <Form.Text className="text-muted">
                Email нельзя изменить
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                placeholder="Расскажите немного о себе..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Сохранение...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Сохранить
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
