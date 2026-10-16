import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/presentation/pages/LoginPage';
import { RegisterPage } from './features/auth/presentation/pages/RegisterPage';
import { ConsoleLayout } from './components/layout/ConsoleLayout';
import { RouteCreatorPage } from './features/console/presentation/pages/routes/RouteCreatorPage';
import { RouteListPage } from './features/console/presentation/pages/routes/RouteListPage';
import { FareManagerPage } from './features/console/presentation/pages/routes/FareManagerPage';
import { RoutesLayout } from './features/console/presentation/pages/routes/layout/RoutesLayout';
import { FleetLayout } from './features/console/presentation/pages/fleet/layout/FleetLayout';
import { FleetListPage } from './features/console/presentation/pages/fleet/FleetListPage';
import { ConsoleDashboardPage } from './features/console/presentation/pages/ConsoleDashboardPage';
import { OnboardingPage } from './features/console/presentation/pages/OnboardingPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Redirigir el home al login o al mapa B2C en el futuro */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas de autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protegido: Accesible por admin y operadores */}
      <Route element={<ProtectedRoute />}>
        <Route path="/console" element={<ConsoleLayout />}>
          {/* Dashboard Dinámico / Buscar Rutas */}
          <Route index element={<ConsoleDashboardPage />} />
          <Route path="search" element={<ConsoleDashboardPage forceSearchMode={true} />} />
          
          {/* Crear Nuevo Negocio */}
          <Route path="new-business" element={<OnboardingPage />} />

          {/* Gestión de Rutas (Workspace) */}
          <Route path="routes" element={<RoutesLayout />}>
            <Route index element={<Navigate to="list" replace />} />
            <Route path="list" element={<RouteListPage />} />
            <Route path="map" element={<div className="p-8 text-center text-gray-500 font-medium">Próximamente: Mapa Global de Cobertura</div>} />
            <Route path="fares" element={<FareManagerPage />} />
          </Route>

          {/* Fuera del layout de rutas para tener pantalla completa */}
          <Route path="routes/editor" element={<RouteCreatorPage />} />

          {/* Gestión de Flota (Workspace) */}
          <Route path="fleet" element={<FleetLayout />}>
            <Route index element={<Navigate to="list" replace />} />
            <Route path="list" element={<FleetListPage />} />
            <Route path="map" element={<div className="p-8 text-center text-gray-500 font-medium">Próximamente: Rastreo de Flota en Vivo</div>} />
            <Route path="maintenance" element={<div className="p-8 text-center text-gray-500 font-medium">Próximamente: Registro de Mantenimiento</div>} />
          </Route>
        </Route>
      </Route>
      
      {/* TODO: Add Super Admin specific routes here wrapped in <ProtectedRoute allowedRoles={['super_admin']}> */}
    </Routes>
  );
}

export default App;
