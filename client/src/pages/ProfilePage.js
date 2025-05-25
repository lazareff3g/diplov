// client/src/pages/ProfilePage.js - ПОЛНАЯ ВЕРСИЯ С ЛОКАЦИЯМИ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Spinner, Badge, Tab, Tabs } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateUser } from '../redux/slices/authSlice';
import LocationCard from '../components/locations/LocationCard';

const ProfilePage = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Состояния для профиля
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ДОБАВЛЯЕМ: Состояния для локаций
  const [userLocations, setUserLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // ДОБАВЛЯЕМ: Состояния для статистики
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalViews: 0,
    totalLikes: 0,
    joinDate: null
  });

  // Инициализация данных пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || ''
      });
      
      const profileImage = user.profile_image || user.profile_picture || user.avatar;
      if (profileImage) {
        let imageUrl;
        if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
          imageUrl = profileImage;
        } else if (profileImage.startsWith('/uploads/')) {
          imageUrl = `http://localhost:5000${profileImage}`;
        } else {
          imageUrl = `http://localhost:5000/uploads/profiles/${profileImage}`;
        }
        setAvatarPreview(imageUrl);
      }
    }
  }, [user]);

  // ДОБАВЛЯЕМ: Загрузка локаций пользователя
  useEffect(() => {
    const fetchUserLocations = async () => {
      if (!user?.id) return;
      
      try {
        setLocationsLoading(true);
        setLocationsError('');
        
        const response = await fetch(`http://localhost:5000/api/locations/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки локаций');
        }
        
        const data = await response.json();
        const locations = data.locations || data || [];
        setUserLocations(Array.isArray(locations) ? locations : []);
        
        // Обновляем статистику
        setStats(prev => ({
          ...prev,
          totalLocations: locations.length,
          joinDate: user.created_at
        }));
        
      } catch (err) {
        console.error('Ошибка загрузки локаций:', err);
        setLocationsError(err.message);
        setUserLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    };

    if (user?.id) {
      fetchUserLocations();
    }
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Файл слишком большой. Максимум 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Можно загружать только изображения');
        return;
      }
      
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Не авторизован');
        return;
      }
      
      let updatedUserData = { ...user };
      
      // Обновляем текстовые данные
      if (formData.username !== user.username || formData.bio !== user.bio) {
        const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            username: formData.username,
            bio: formData.bio
          })
        });
        
        if (!profileResponse.ok) {
          throw new Error('Ошибка обновления профиля');
        }
        
        updatedUserData = {
          ...updatedUserData,
          username: formData.username,
          bio: formData.bio
        };
      }
      
      // Загружаем аватарку если выбрана
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', avatarFile);
        
        const imageResponse = await fetch('http://localhost:5000/api/users/profile/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });
        
        if (!imageResponse.ok) {
          throw new Error('Ошибка загрузки аватарки');
        }
        
        const imageData = await imageResponse.json();
        
        if (imageData.success && imageData.imageUrl) {
          const fullImageUrl = `http://localhost:5000${imageData.imageUrl}`;
          
          updatedUserData = {
            ...updatedUserData,
            profile_image: fullImageUrl,
            profile_picture: fullImageUrl,
            avatar: fullImageUrl
          };
          
          localStorage.setItem('profileImage', fullImageUrl);
          setAvatarPreview(fullImageUrl);
        }
      }
      
      dispatch(updateUser(updatedUserData));
      
      setSuccess('Профиль успешно обновлен!');
      setAvatarFile(null);
      
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message || 'Ошибка при обновлении профиля');
    } finally {
      setUpdating(false);
    }
  };

  // ДОБАВЛЯЕМ: Функция удаления локации
  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту локацию?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUserLocations(prev => prev.filter(loc => loc.id !== locationId));
        setStats(prev => ({
          ...prev,
          totalLocations: prev.totalLocations - 1
        }));
      } else {
        throw new Error('Ошибка удаления локации');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении локации');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Пожалуйста, войдите в систему для просмотра профиля
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">👤 Профиль пользователя</h1>
        </Col>
      </Row>

      {/* ДОБАВЛЯЕМ: Вкладки */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* Вкладка профиля */}
        <Tab eventKey="profile" title="📋 Профиль">
          <Row>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    {avatarPreview ? (
                      <img 
                        key={avatarPreview}
                        src={avatarPreview} 
                        alt="Аватар" 
                        style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #dee2e6'
                        }}
                        onError={() => setAvatarPreview(null)}
                      />
                    ) : (
                      <div 
                        style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontSize: '48px',
                          color: '#6c757d',
                          border: '3px solid #dee2e6'
                        }}
                      >
                        👤
                      </div>
                    )}
                    
                    <h4 className="mt-3">{user?.username || 'Пользователь'}</h4>
                    <p className="text-muted">{user?.email}</p>
                    {user?.bio && <p className="text-muted">{user.bio}</p>}
                    
                    {/* ДОБАВЛЯЕМ: Бейджи */}
                    <div className="mb-3">
                      {user?.role === 'admin' && (
                        <Badge bg="primary" className="me-2">Администратор</Badge>
                      )}
                      <Badge bg="success">Активный пользователь</Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => setShowEditModal(true)}
                    className="w-100"
                  >
                    ✏️ Редактировать профиль
                  </Button>
                </Card.Body>
              </Card>

              {/* ДОБАВЛЯЕМ: Статистика */}
              <Card>
                <Card.Header>
                  <h5 className="mb-0">📊 Статистика</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Локаций добавлено:</span>
                    <Badge bg="primary">{stats.totalLocations}</Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Дата регистрации:</span>
                    <small className="text-muted">
                      {stats.joinDate ? new Date(stats.joinDate).toLocaleDateString() : 'Неизвестно'}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">ℹ️ Информация</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Имя:</strong> {user?.username || 'Не указано'}</p>
                      <p><strong>Email:</strong> {user?.email || 'Не указано'}</p>
                      <p><strong>Роль:</strong> {user?.role || 'user'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Аватарка:</strong> {avatarPreview ? '✅ Установлена' : '❌ Не установлена'}</p>
                      <p><strong>Локаций:</strong> {stats.totalLocations}</p>
                      <p><strong>Статус:</strong> <Badge bg="success">Активен</Badge></p>
                    </Col>
                  </Row>
                  
                  {user?.bio && (
                    <div className="mt-3">
                      <strong>О себе:</strong>
                      <p className="mt-2 p-3 bg-light rounded">{user.bio}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ДОБАВЛЯЕМ: Вкладка локаций */}
        <Tab eventKey="locations" title={`📍 Мои локации (${stats.totalLocations})`}>
          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>📍 Мои локации</h3>
                <Link to="/locations/add">
                  <Button variant="primary">
                    ➕ Добавить новую локацию
                  </Button>
                </Link>
              </div>

              {locationsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Загрузка локаций...</p>
                </div>
              ) : locationsError ? (
                <Alert variant="danger">
                  <strong>Ошибка:</strong> {locationsError}
                </Alert>
              ) : userLocations.length === 0 ? (
                <Alert variant="info">
                  <h5>📭 У вас пока нет добавленных локаций</h5>
                  <p>Начните делиться своими любимыми местами для фотосъемки!</p>
                  <Link to="/locations/add">
                    <Button variant="primary">
                      📍 Добавить первую локацию
                    </Button>
                  </Link>
                </Alert>
              ) : (
                <Row>
                  {userLocations.map(location => (
                    <Col key={location.id} md={6} lg={4} className="mb-4">
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title">{location.name}</h6>
                            <div>
                              <Link 
                                to={`/locations/${location.id}/edit`}
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                ✏️
                              </Link>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteLocation(location.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          
                          <p className="card-text text-muted small">
                            {location.description || 'Описание не указано'}
                          </p>
                          
                          <div className="mb-2">
                            {location.category_name && (
                              <Badge bg="secondary" className="me-2">
                                {location.category_name}
                              </Badge>
                            )}
                            {location.accessibility && (
                              <Badge bg="info">
                                {location.accessibility}
                              </Badge>
                            )}
                          </div>
                          
                          <small className="text-muted">
                            Создано: {new Date(location.created_at).toLocaleDateString()}
                          </small>
                          
                          <div className="mt-2">
                            <Link 
                              to={`/locations/${location.id}`}
                              className="btn btn-sm btn-primary w-100"
                            >
                              👁️ Просмотреть
                            </Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        </Tab>

        {/* ДОБАВЛЯЕМ: Вкладка настроек */}
        <Tab eventKey="settings" title="⚙️ Настройки">
          <Row>
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">⚙️ Настройки аккаунта</h5>
                </Card.Header>
                <Card.Body>
                  <h6>🔒 Безопасность</h6>
                  <p className="text-muted">Управление паролем и безопасностью аккаунта</p>
                  <Button variant="outline-primary" className="mb-3">
                    Изменить пароль
                  </Button>
                  
                  <hr />
                  
                  <h6>🔔 Уведомления</h6>
                  <Form.Check 
                    type="checkbox" 
                    label="Уведомления о новых локациях поблизости"
                    defaultChecked 
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox" 
                    label="Email уведомления"
                    defaultChecked 
                    className="mb-2"
                  />
                  
                  <hr />
                  
                  <h6>🗑️ Опасная зона</h6>
                  <p className="text-muted">Необратимые действия с аккаунтом</p>
                  <Button variant="outline-danger">
                    Удалить аккаунт
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Модальное окно редактирования - остается тем же */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Редактирование профиля</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            <div className="text-center mb-4">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Предпросмотр" 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #dee2e6'
                  }}
                />
              ) : (
                <div 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '40px',
                    color: '#6c757d',
                    border: '3px solid #dee2e6'
                  }}
                >
                  👤
                </div>
              )}
              
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button as="span" variant="outline-primary" size="sm">
                    📷 Выбрать фото
                  </Button>
                </label>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Введите имя пользователя"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Расскажите о себе..."
                maxLength={500}
              />
              <Form.Text className="text-muted">
                Осталось символов: {500 - formData.bio.length}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEditModal(false)}
            disabled={updating}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Сохранение...
              </>
            ) : (
              '💾 Сохранить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
