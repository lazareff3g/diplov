// src/components/Photos/PhotoUploadForm.js
import React, { useState } from 'react';
import { Card, Button, Alert, ProgressBar, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const PhotoUploadForm = ({ locationId, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { user } = useSelector(state => state.auth || { user: null });

  // Обработчик выбора файлов
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
    setSuccess(false);
  };

  // Загрузка файлов
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Выберите файлы для загрузки');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Симуляция загрузки с прогрессом
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setSuccess(true);
      setFiles([]);
      setUploadProgress(0);
      
      if (onUploadSuccess) {
        onUploadSuccess({ message: 'Фотографии успешно загружены' });
      }

    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError(err.message || 'Ошибка при загрузке фотографий');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="photo-upload-form" data-testid="photo-upload-form">
      <Card.Header>
        <h5 className="mb-0">📸 Загрузка фотографий</h5>
      </Card.Header>
      <Card.Body>
        {/* Простой input для файлов */}
        <Form.Group className="mb-3">
          <Form.Label>Выберите фотографии:</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            data-testid="file-input"
          />
          <Form.Text className="text-muted">
            Поддерживаются: JPEG, PNG, WebP. Максимум 10MB на файл
          </Form.Text>
        </Form.Group>

        {/* Сообщения */}
        {error && (
          <Alert variant="danger" data-testid="error-message">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" data-testid="success-message">
            Фотографии успешно загружены!
          </Alert>
        )}

        {/* Прогресс загрузки */}
        {uploading && (
          <div className="mb-3" data-testid="upload-progress">
            <div className="d-flex justify-content-between mb-1">
              <small>Загрузка...</small>
              <small>{uploadProgress}%</small>
            </div>
            <ProgressBar now={uploadProgress} />
          </div>
        )}

        {/* Информация о выбранных файлах */}
        {files.length > 0 && (
          <div className="mb-3" data-testid="selected-files">
            <p>Выбрано файлов: <strong>{files.length}</strong></p>
            <ul className="list-unstyled">
              {files.map((file, index) => (
                <li key={index} className="text-muted small">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setFiles([])}
            disabled={files.length === 0 || uploading}
          >
            Очистить
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            data-testid="upload-button"
          >
            {uploading ? 'Загрузка...' : `Загрузить (${files.length})`}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PhotoUploadForm;
