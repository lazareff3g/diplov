// client/src/components/map/__tests__/MapComponent.test.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React from 'react';
import { render, screen } from '@testing-library/react';
import MapComponent from '../MapComponent';

// Mock Yandex Maps
jest.mock('@pbe/react-yandex-maps', () => ({
  YMaps: ({ children }) => <div data-testid="ymaps">{children}</div>,
  Map: ({ children, ...props }) => (
    <div data-testid="yandex-map" {...props}>
      {children}
    </div>
  ),
  Placemark: (props) => <div data-testid="placemark" {...props} />,
  ZoomControl: () => <div data-testid="zoom-control" />,
  GeolocationControl: () => <div data-testid="geolocation-control" />
}));

describe('MapComponent', () => {
  test('renders map component', () => {
    render(<MapComponent />);
    
    expect(screen.getByTestId('ymaps')).toBeInTheDocument();
    expect(screen.getByTestId('yandex-map')).toBeInTheDocument();
  });

  test('renders with custom center and zoom', () => {
    const center = [59.9311, 30.3609]; // Санкт-Петербург
    const zoom = 12;
    
    render(<MapComponent center={center} zoom={zoom} />);
    
    expect(screen.getByTestId('yandex-map')).toBeInTheDocument();
  });

  test('renders placemark when location is selected', () => {
    const selectedLocation = {
      coordinates: [55.751244, 37.618423],
      name: 'Тестовая локация',
      address: 'Тестовый адрес'
    };
    
    render(<MapComponent selectedLocation={selectedLocation} />);
    
    expect(screen.getByTestId('placemark')).toBeInTheDocument();
  });

  test('renders search controls when interactive', () => {
    render(<MapComponent interactive={true} />);
    
    expect(screen.getByPlaceholderText('Введите адрес для поиска...')).toBeInTheDocument();
    expect(screen.getByText('🔍 Найти')).toBeInTheDocument();
  });

  test('does not render search controls when not interactive', () => {
    render(<MapComponent interactive={false} />);
    
    expect(screen.queryByPlaceholderText('Введите адрес для поиска...')).not.toBeInTheDocument();
    expect(screen.queryByText('🔍 Найти')).not.toBeInTheDocument();
  });
});
