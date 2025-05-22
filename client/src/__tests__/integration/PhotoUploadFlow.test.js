// src/__tests__/integration/PhotoUploadFlow.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../redux/slices/authSlice';
import PhotoUploadForm from '../../components/Photos/PhotoUploadForm';

describe('Photo Upload Flow', () => {
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

  test('photo upload form renders successfully', () => {
    render(
      <Provider store={store}>
        <PhotoUploadForm />
      </Provider>
    );

    expect(screen.getByTestId('photo-upload-form')).toBeInTheDocument();
    expect(screen.getByText('📸 Загрузка фотографий')).toBeInTheDocument();
  });
});
