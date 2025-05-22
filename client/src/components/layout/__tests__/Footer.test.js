import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('renders footer content', () => {
    render(<Footer />);
    
    // Проверяем, что футер содержит текст или элементы
    expect(screen.getByText(/©/i)).toBeInTheDocument();
  });
});
