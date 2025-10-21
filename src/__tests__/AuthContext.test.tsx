import React from 'react';
import { render } from '@testing-library/react';
import AuthContext from '../AuthContext';

test('renders AuthContext component', () => {
  render(<AuthContext />);
  const linkElement = screen.getByText(/auth context/i);
  expect(linkElement).toBeInTheDocument();
});