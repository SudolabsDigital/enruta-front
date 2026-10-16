import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GlobalHUD } from './GlobalHUD';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingPage } from '../../features/console/presentation/pages/OnboardingPage';

export const ConsoleLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isSuperAdmin = user?.role === 'super_admin';
  const hasBusiness = user?.businesses && user.businesses.length > 0;

  // Si no es super admin y no tiene negocios, mostrar el Onboarding en lugar del layout
  if (!isSuperAdmin && !hasBusiness && location.pathname !== '/console/search') {
    return <OnboardingPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <GlobalHUD />
      <main className="flex-1 pl-[4.5rem] transition-[padding-left] duration-250 ease h-full relative max-md:pl-0">
        {/* Aquí renderizan las sub-rutas (dashboard, rutas, perfil, etc.) */}
        <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
            <Outlet />
        </div>
      </main>
    </div>
  );
};
