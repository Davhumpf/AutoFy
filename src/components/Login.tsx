import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      if (email === 'scpu.v1@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      toast.success('Inicio de sesión exitoso');
    } catch (error) {
      toast.error('Error al iniciar sesión');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
      toast.success('Inicio de sesión con Google exitoso');
    } catch (error) {
      toast.error('Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b1f] flex items-center justify-center">
      <div className="bg-[#2a2b31] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1b1f] text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#57A639]"
                placeholder="Correo electrónico"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1b1f] text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#57A639]"
                placeholder="Contraseña"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#57A639] text-white py-3 rounded-lg hover:bg-[#4CAF50] transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#2a2b31] text-gray-400">O continúa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continuar con Google
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400">
          ¿No tienes una cuenta?{' '}
          <a href="/register" className="text-[#57A639] hover:text-[#4CAF50]">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}