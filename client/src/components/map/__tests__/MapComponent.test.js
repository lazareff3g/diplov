// src/components/map/__tests__/MapComponent.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MapComponent from '../MapComponent';

// Мокируем Яндекс Карты
jest.mock('@pbe/react-yandex-maps', () => ({
  YMaps: ({ children }) => <div data-testid="ymaps">{children}</div>,
  Map: ({ children, width, height }) => (
    <div data-testid="map" style={{ width, height }}>
      {children}
    </div>
  ),
  Placemark: ({ onClick }) => <div data-testid="placemark" onClick={onClick}></div>
}));

describe('MapComponent', () => {
  const mockLocations = [
    {
      id: 1,
      name: 'Тестовая локация 1',
      description: 'Описание тестовой локации 1',
      latitude: 55.7558,
      longitude: 37.6173
    },
    {
      id: 2,
      name: 'Тестовая локация 2',
      description: 'Описание тестовой локации 2',
      latitude: 59.9343,
      longitude: 30.3351
    }
  ];
  
  const mockOnLocationSelect = jest.fn();

  test('renders loading state', () => {
    render(<MapComponent locations={[]} loading={true} onLocationSelect={mockOnLocationSelect} />);
    expect(screen.getByText('Загрузка карты...')).toBeInTheDocument();
  });

  test('renders map container', () => {
    render(<MapComponent locations={[]} loading={false} onLocationSelect={mockOnLocationSelect} />);
    expect(screen.getByTestId('ymaps')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  test('renders placemarks for locations', () => {
    render(<MapComponent locations={mockLocations} loading={false} onLocationSelect={mockOnLocationSelect} />);
    
    // Проверяем, что метки отображаются
    const placemarks = screen.getAllByTestId('placemark');
    expect(placemarks).toHaveLength(mockLocations.length);
  });

  test('calls onLocationSelect when placemark is clicked', () => {
    render(<MapComponent locations={mockLocations} loading={false} onLocationSelect={mockOnLocationSelect} />);
    
    // Кликаем по первой метке
    const placemarks = screen.getAllByTestId('placemark');
    fireEvent.click(placemarks[0]);
    
    // Проверяем, что onLocationSelect был вызван с правильным ID
    expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocations[0].id);
  });
});
