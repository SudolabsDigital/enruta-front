import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building2, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardBody } from '../../../../components/ui';
import { authService } from '../../services/authService';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../hooks/useNotification';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [accountType, setAccountType] = useState<'b2c' | 'b2b'>('b2b');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  // Validación en tiempo real (feedback)
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isPasswordValid = isLengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  const doPasswordsMatch = password === passwordConfirmation && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      error("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }
    if (!doPasswordsMatch) {
      error("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setInputError(null);

    try {
      const data = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role_type: accountType
      });
      
      login(data.token, data.user);
      success("Cuenta creada exitosamente");
      
      // Redirección basada en el tipo de cuenta
      if (accountType === 'b2c') {
        navigate('/console/search'); // Consulta existente; Google y experiencia B2C completa siguen en T006.
      } else {
        navigate('/console'); // Onboarding/Console B2B
      }
    } catch (err) {
      const errorObj = err as { response?: { data?: { errors?: Record<string, string[]>, message?: string } } };
      
      if (errorObj.response?.data?.errors) {
        // Tomar el primer error del objeto errors
        const firstErrorKey = Object.keys(errorObj.response.data.errors)[0];
        const msg = errorObj.response.data.errors[firstErrorKey][0];
        if (firstErrorKey === 'email') {
          setInputError(msg);
        } else {
          error(msg, "Error de validación");
        }
      } else if (errorObj.response?.data?.message) {
        error(errorObj.response.data.message, "Error al registrarse");
      } else {
        error('Error al registrar cuenta. Revisa tu conexión.', "Error de red");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-800 p-4 max-sm:p-0 max-sm:bg-white">
      <Card className="w-full max-w-[500px] bg-white max-sm:max-w-full max-sm:h-screen max-sm:rounded-none max-sm:shadow-none max-sm:flex max-sm:flex-col max-sm:justify-center" elevation="lg" padding="none">
        <CardHeader className="text-center pt-10 px-6 pb-6 border-b-0 mb-0 max-sm:pt-0">
          <div className="mb-6 flex justify-center">
            <img src="/logo.webp" alt="EnRuta Logo" className="h-[60px] w-auto drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Crear Cuenta</h1>
          <p className="text-gray-500 text-sm font-medium">Únete a EnRuta</p>
        </CardHeader>
        
        <CardBody className="pt-2 px-8 pb-8">
          <div className="mb-8">
            <label className="block mb-2 font-semibold text-sm text-gray-700">
              Tipo de Cuenta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setAccountType('b2c')}
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 ${accountType === 'b2c' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
              >
                <UserIcon size={24} className={`mx-auto mb-2 ${accountType === 'b2c' ? 'text-primary-500' : 'text-gray-500'}`} />
                <div className={`font-semibold text-sm ${accountType === 'b2c' ? 'text-primary-500' : 'text-gray-700'}`}>Usuario Regular</div>
                <div className="text-xs text-gray-500 mt-1">Explorar rutas</div>
              </div>
              <div 
                onClick={() => setAccountType('b2b')}
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 ${accountType === 'b2b' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
              >
                <Building2 size={24} className={`mx-auto mb-2 ${accountType === 'b2b' ? 'text-primary-500' : 'text-gray-500'}`} />
                <div className={`font-semibold text-sm ${accountType === 'b2b' ? 'text-primary-500' : 'text-gray-700'}`}>Empresa / Negocio</div>
                <div className="text-xs text-gray-500 mt-1">Gestionar operaciones</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input 
              label="Nombre Completo" 
              type="text" 
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon size={18} />}
              required
            />
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              error={inputError || undefined}
              required
            />
            
            <div className="relative">
              <Input 
                label="Contraseña" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[2.1rem] bg-transparent border-none cursor-pointer text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs -mt-2 mb-2">
                <div className={isLengthValid ? 'text-success-600' : 'text-gray-500'}>
                  {isLengthValid ? '✓' : '○'} Mínimo 8 caracteres
                </div>
                <div className={(hasUpperCase && hasLowerCase) ? 'text-success-600' : 'text-gray-500'}>
                  {(hasUpperCase && hasLowerCase) ? '✓' : '○'} Mayúsculas y minúsculas
                </div>
                <div className={hasNumber ? 'text-success-600' : 'text-gray-500'}>
                  {hasNumber ? '✓' : '○'} Al menos 1 número
                </div>
                <div className={hasSpecial ? 'text-success-600' : 'text-gray-500'}>
                  {hasSpecial ? '✓' : '○'} Carácter especial (!@#$...)
                </div>
              </div>
            )}

            <Input 
              label="Confirmar Contraseña" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              leftIcon={<Lock size={18} />}
              error={(passwordConfirmation.length > 0 && !doPasswordsMatch) ? "Las contraseñas no coinciden" : undefined}
              required
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              isLoading={isLoading} 
              disabled={!isPasswordValid || !doPasswordsMatch}
              className="mt-4"
            >
              Registrarse
            </Button>
          </form>
        </CardBody>

        <div className="p-6 text-center text-sm text-gray-500 border-t border-gray-200 bg-gray-50">
          ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="text-primary-500 font-semibold no-underline hover:text-primary-600 hover:underline transition-colors duration-200">Iniciar sesión aquí</a>
        </div>
      </Card>
    </div>
  );
};
