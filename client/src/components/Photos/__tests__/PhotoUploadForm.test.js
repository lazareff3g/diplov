// src/components/Photos/__tests__/PhotoUploadForm.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../redux/slices/authSlice';
import PhotoUploadForm from '../PhotoUploadForm';

describe('PhotoUploadForm', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer
      },
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Test User' },
          isAuthenticated: true
        }
      }
    });
  });

  test('renders photo upload form', () => {
    render(
      <Provider store={store}>
        <PhotoUploadForm />
      </Provider>
    );

    expect(screen.getByTestId('photo-upload-form')).toBeInTheDocument();
    expect(screen.getByText('📸 Загрузка фотографий')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  test('shows upload button', () => {
    render(
      <Provider store={store}>
        <PhotoUploadForm />
      </Provider>
    );

    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
  });
});
