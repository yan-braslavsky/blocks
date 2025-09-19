'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Tenant {
  id: string;
  name: string;
  connectionStatus: 'unconfigured' | 'pending' | 'validated' | 'error';
  lastIngestAt?: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with stub tenant data
  useEffect(() => {
    // In mock mode, use a predefined tenant
    const stubTenant: Tenant = {
      id: '01234567-89ab-cdef-0123-456789abcdef',
      name: 'Demo Organization',
      connectionStatus: 'validated',
      lastIngestAt: '2025-09-19T08:30:00.000Z'
    };

    // Simulate loading delay
    const timer = setTimeout(() => {
      setTenantState(stubTenant);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const setTenant = (newTenant: Tenant) => {
    setTenantState(newTenant);
    // In a real implementation, this would also persist to localStorage or API
  };

  const value = {
    tenant,
    setTenant,
    isLoading
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};