"use client";

import { ReactNode } from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <LanguageProvider>
      {children}
      <LanguageToggle />
    </LanguageProvider>
  );
}