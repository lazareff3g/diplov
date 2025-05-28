// client/src/pages/__tests__/LocationDetailPage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

const LocationDetailPage = () => (
  <div data-testid="location-detail-page">
    <h1>Location Detail Page</h1>
  </div>
);

describe('LocationDetailPage', () => {
  test('отображает страницу детальной информации', () => {
    render(<LocationDetailPage />);
    expect(screen.getByTestId('location-detail-page')).toBeInTheDocument();
  });
});
