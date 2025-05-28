// client/src/components/map/__tests__/MapComponent.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

const MapComponent = () => (
  <div data-testid="map-component">Map Component</div>
);

describe('MapComponent', () => {
  test('отображает карту', () => {
    render(<MapComponent />);
    expect(screen.getByTestId('map-component')).toBeInTheDocument();
  });
});
