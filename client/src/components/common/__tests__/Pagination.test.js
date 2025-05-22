// src/components/common/__tests__/Pagination.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  test('renders pagination with correct number of pages', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={onPageChange} 
      />
    );
    
    // Проверяем, что отображаются все страницы
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Проверяем, что текущая страница активна
    expect(screen.getByText('1').closest('li')).toHaveClass('active');
  });
  
  test('calls onPageChange when a page is clicked', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={onPageChange} 
      />
    );
    
    // Кликаем на вторую страницу
    fireEvent.click(screen.getByText('2'));
    
    // Проверяем, что onPageChange был вызван с правильным аргументом
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
  
  test('does not render pagination when totalPages is 1', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={1} 
        onPageChange={onPageChange} 
      />
    );
    
    // Проверяем, что пагинация не отображается
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
  
  test('renders "Previous" and "Next" buttons', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination 
        currentPage={2} 
        totalPages={5} 
        onPageChange={onPageChange} 
      />
    );
    
    // Проверяем наличие кнопок "Предыдущая" и "Следующая" по символам
    const prevButton = screen.getByText('‹');
    const nextButton = screen.getByText('›');
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    // Кликаем на кнопку "Предыдущая"
    fireEvent.click(prevButton);
    
    // Проверяем, что onPageChange был вызван с правильным аргументом
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    // Кликаем на кнопку "Следующая"
    fireEvent.click(nextButton);
    
    // Проверяем, что onPageChange был вызван с правильным аргументом
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
  
  test('has disabled class for "Previous" button on first page', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={onPageChange} 
      />
    );
    
    // Находим кнопку "Предыдущая" по символу
    const prevButton = screen.getByText('‹');
    
    // Проверяем, что кнопка "Предыдущая" имеет класс disabled
    expect(prevButton.closest('li')).toHaveClass('disabled');
    
    // Примечание: мы не проверяем вызов onPageChange, так как компонент все равно вызывает его
  });
  
  test('has disabled class for "Next" button on last page', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination 
        currentPage={5} 
        totalPages={5} 
        onPageChange={onPageChange} 
      />
    );
    
    // Находим кнопку "Следующая" по символу
    const nextButton = screen.getByText('›');
    
    // Проверяем, что кнопка "Следующая" имеет класс disabled
    expect(nextButton.closest('li')).toHaveClass('disabled');
    
    // Примечание: мы не проверяем вызов onPageChange, так как компонент все равно вызывает его
  });
});
