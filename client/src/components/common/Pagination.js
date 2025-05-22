// src/components/common/Pagination.js
import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Если всего одна страница, не отображаем пагинацию
  if (totalPages <= 1) {
    return null;
  }

  // Функция для обработки клика по кнопке "Предыдущая"
  const handlePrevClick = () => {
    // Проверяем, что не находимся на первой странице
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Функция для обработки клика по кнопке "Следующая"
  const handleNextClick = () => {
    // Проверяем, что не находимся на последней странице
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Создаем массив страниц для отображения
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <BootstrapPagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => onPageChange(i)}
      >
        {i}
      </BootstrapPagination.Item>
    );
  }

  return (
    <BootstrapPagination className="justify-content-center mt-4">
      <BootstrapPagination.Prev
        onClick={handlePrevClick}
        disabled={currentPage === 1}
      />
      {pages}
      <BootstrapPagination.Next
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
      />
    </BootstrapPagination>
  );
};

export default Pagination;
