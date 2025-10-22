'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Module {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const modules: Module[] = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial Management',
    url: 'http://localhost:6850',
    color: 'from-cyan-500 to-blue-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'hms',
    name: 'HMS',
    description: 'Hospital Management',
    url: 'http://localhost:6830',
    color: 'from-blue-500 to-indigo-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'hrms',
    name: 'HRMS',
    description: 'Human Resources',
    url: 'http://localhost:6860',
    color: 'from-purple-500 to-pink-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    description: 'Procurement & Orders',
    url: 'http://localhost:6870',
    color: 'from-orange-500 to-red-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'roster',
    name: 'Rostering',
    description: 'Staff Scheduling',
    url: 'http://localhost:6840',
    color: 'from-green-500 to-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export interface FurfieldHeaderProps {
  currentModule?: string;
  showModuleSwitcher?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const FurfieldHeader: React.FC<FurfieldHeaderProps> = ({
  currentModule,
  showModuleSwitcher = true,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  userName = 'Admin User',
  userRole = 'Administrator',
  onLogout,
}) => {
  const [isModuleSwitcherOpen, setIsModuleSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModuleData = modules.find(m => m.id === currentModule);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModuleSwitcherOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModuleSwitch = (url: string) => {
    // Get current token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('furfield_token='))
      ?.split('=')[1];

    // Redirect to new module with token
    if (token) {
      window.location.href = `${url}?auth_token=${token}`;
    } else {
      window.location.href = url;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Module Switcher */}
          {showModuleSwitcher && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsModuleSwitcherOpen(!isModuleSwitcherOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                {currentModuleData && (
                  <div className={`w-8 h-8 bg-gradient-to-r ${currentModuleData.color} rounded-lg flex items-center justify-center text-white`}>
                    {currentModuleData.icon}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentModuleData?.name || 'FURFIELD'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentModuleData?.description || 'Switch Module'}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isModuleSwitcherOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {isModuleSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        F
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">FURFIELD</div>
                        <div className="text-xs text-gray-500">Platform Modules</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto py-2">
                    {modules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleModuleSwitch(module.url)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                          currentModule === module.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                          {module.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {module.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {module.description}
                          </div>
                        </div>
                        {currentModule === module.id && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                aria-label="Search"
                suppressHydrationWarning
                className="w-64 h-10 pl-10 pr-4 rounded-lg border-0 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          {showNotifications && (
            <button
              className="relative p-2 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* User Menu */}
          {showUserMenu && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-2 text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
