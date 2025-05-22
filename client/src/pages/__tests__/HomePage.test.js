import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';

describe('HomePage Component', () => {
  test('renders welcome message and call to action', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Проверяем наличие заголовка
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Найдите идеальное место для фотосессии/i);
    
    // Проверяем наличие кнопки призыва к действию
    expect(screen.getByRole('link', { name: /Найти локации/i })).toBeInTheDocument();
  });
});
