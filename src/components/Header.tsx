'use client';

import React from 'react';
import { FurfieldHeader } from './FurfieldHeader';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <FurfieldHeader
      userName={user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
      userRole={user?.role || 'Guest'}
      onLogout={handleLogout}
    />
  );
};
