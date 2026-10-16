import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardBody } from '../../../../components/ui';
import { authService } from '../../services/authService';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../hooks/useNotification';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInputError(null);

    try {
      const data = await authService.login(email, password);
      login(data.token, data.user);
      success(`Bienvenido de nuevo, ${data.user.name}`);
      
      if (data.user.role === 'standard_user' && !data.user.businesses?.length && !data.user.business_memberships?.length) {
        navigate('/console/search');
      } else {
        navigate('/console');
      }
    } catch (err) {
      const errorObj = err as { response?: { data?: { errors?: { email?: string[] }, message?: string } } };
      if (errorObj.response?.data?.errors?.email) {
        setInputError(errorObj.response.data.errors.email[0]);
      } else if (errorObj.response?.data?.message) {
        error(errorObj.response.data.message, "Error al iniciar sesión");
      } else {
        error('Error al intentar iniciar sesión. Revisa tu conexión.', "Error de red");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-800 p-4 max-sm:p-0 max-sm:bg-white">
      <Card className="w-full max-w-[420px] bg-white max-sm:max-w-full max-sm:h-screen max-sm:rounded-none max-sm:shadow-none max-sm:flex max-sm:flex-col max-sm:justify-center" elevation="lg" padding="none">
        <CardHeader className="text-center pt-10 px-6 pb-6 border-b-0 mb-0 max-sm:pt-0">
          <div className="mb-6 flex justify-center">
            <img src="/logo.webp" alt="EnRuta Logo" className="h-[60px] w-auto drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Bienvenido</h1>
          <p className="text-gray-500 text-sm font-medium">Plataforma de Gestión para Operadores</p>
        </CardHeader>
        
        <CardBody className="pt-2 px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="admin@enruta.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              error={inputError || undefined}
              required
            />
            <Input 
              label="Contraseña" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              required
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              isLoading={isLoading} 
              rightIcon={<LogIn size={20} />}
              className="mt-2"
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardBody>

        <div className="p-6 text-center text-sm text-gray-500 border-t border-gray-200 bg-gray-50">
          ¿No tienes una cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="text-primary-500 font-semibold no-underline hover:text-primary-600 hover:underline transition-colors duration-200">Crear una cuenta</a>
        </div>
      </Card>
    </div>
  );
};
