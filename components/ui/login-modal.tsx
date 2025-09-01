"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      const success = await login(username.trim(), password);
      if (success) {
        onClose();
        setUsername('');
        setPassword('');
        setError('');
      } else {
        setError('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setUsername('');
      setPassword('');
      setError('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Iniciar Sesión</h2>
                <p className="text-blue-100">Accede a tu cuenta de Factura Móvil</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Usuario
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    disabled={isLoading}
                    className="pl-10 pr-4 py-3"
                    required
                  />
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                    className="pl-10 pr-12 py-3"
                    required
                  />
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Demo Info */}
              <div className="text-center">
                          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ¿No tienes cuenta? Contacta a soporte para obtener acceso
            </p>
            <div className="text-xs text-blue-500 dark:text-blue-400">
              <p><strong>Credenciales de acceso:</strong></p>
              <p>Usuario: admin4</p>
              <p>Contraseña: 83559705</p>
            </div>
          </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
