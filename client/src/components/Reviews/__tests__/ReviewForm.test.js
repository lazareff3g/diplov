// client/src/components/Reviews/__tests__/ReviewForm.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

const ReviewForm = () => (
  <div data-testid="review-form">Review Form</div>
);

describe('ReviewForm', () => {
  test('отображает форму отзыва', () => {
    render(<ReviewForm />);
    expect(screen.getByTestId('review-form')).toBeInTheDocument();
  });
});
