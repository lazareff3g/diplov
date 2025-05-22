// src/components/Photos/PhotoGallery.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import photoService from '../../services/photoService';
import './PhotoGallery.css';

const PhotoGallery = ({ locationId, canAddPhotos = false }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Загрузка фотографий
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!locationId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedPhotos = await photoService.getPhotosByLocationId(locationId);
        setPhotos(Array.isArray(fetchedPhotos) ? fetchedPhotos : []);
      } catch (err) {
        console.error('Ошибка при загрузке фотографий:', err);
        setError('Не удалось загрузить фотографии');
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [locationId]);

  // Получаем текущего пользователя из localStorage
  const getCurrentUser = () => {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (err) {
      console.error('Ошибка при получении данных пользователя:', err);
      return null;
    }
  };

  // Обработчик выбора файла
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Создаем превью изображения
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Пожалуйста, выберите файл');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('location_id', locationId);
    formData.append('description', description);

    try {
      setUploading(true);
      setUploadError(null);
      
      const newPhoto = await photoService.uploadPhoto(formData);
      
      setPhotos([newPhoto, ...photos]);
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDescription('');
    } catch (err) {
      console.error('Ошибка при загрузке фотографии:', err);
      setUploadError(err.response?.data?.error || 'Не удалось загрузить фотографию');
    } finally {
      setUploading(false);
    }
  };

  // Обработчик удаления фотографии
  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту фотографию?')) {
      try {
        await photoService.deletePhoto(photoId);
        setPhotos(photos.filter(photo => photo.id !== photoId));
      } catch (err) {
        console.error('Ошибка при удалении фотографии:', err);
        alert('Не удалось удалить фотографию');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4" data-testid="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" data-testid="error-message">{error}</Alert>;
  }

  return (
    <div className="photo-gallery">
      {canAddPhotos && (
        <div className="mb-4">
          <Button variant="primary" onClick={() => setShowModal(true)} data-testid="add-photo-button">
            <FaPlus className="me-2" /> Добавить фотографию
          </Button>
        </div>
      )}

      {photos.length === 0 ? (
        <Alert variant="info" data-testid="no-photos-message">
          Для этой локации еще нет фотографий.
          {canAddPhotos && ' Будьте первым, кто добавит фотографию!'}
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4" data-testid="photos-grid">
          {photos.map(photo => (
            <Col key={photo.id}>
              <Card className="photo-card h-100">
                <div className="photo-container">
                  <Card.Img 
                    variant="top" 
                    src={photo.url} 
                    alt={photo.description || 'Фотография локации'} 
                    className="photo-image"
                    onClick={() => window.open(photo.url, '_blank')}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <Card.Body>
                  {photo.description && (
                    <Card.Text>{photo.description}</Card.Text>
                  )}
                  <div className="photo-info">
                    <small className="text-muted">
                      Добавил: {photo.username || 'Неизвестно'}
                    </small>
                    {photo.user_id === getCurrentUser()?.id && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeletePhoto(photo.id)}
                        data-testid={`delete-photo-${photo.id}`}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Модальное окно для добавления фотографии */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить фотографию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Выберите фотографию</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                required
              />
              <Form.Text className="text-muted">
                Максимальный размер файла: 5 МБ. Поддерживаемые форматы: JPG, PNG, GIF.
              </Form.Text>
            </Form.Group>
            
            {previewUrl && (
              <div className="mb-3 text-center">
                <img 
                  src={previewUrl} 
                  alt="Превью" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
                  className="img-thumbnail"
                />
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Описание (необязательно)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Добавьте описание к фотографии"
              />
            </Form.Group>
            
            {uploadError && (
              <Alert variant="danger">{uploadError}</Alert>
            )}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Отмена
              </Button>
              <Button variant="primary" type="submit" disabled={uploading}>
                {uploading ? 'Загрузка...' : 'Загрузить'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PhotoGallery;
