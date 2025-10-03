import React, { useState } from 'react';
// FIX: Import AuthResult for type safety with authService calls.
import { authService, type AuthResult } from '../auth/authService';
import type { User } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'verify';

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // FIX: Use the imported AuthResult type for the result parameter to ensure messageKey is correctly typed.
  const handleAuthResult = (result: AuthResult | Omit<AuthResult, 'user'>) => {
      if (result.success) {
          setMessage(t(result.messageKey));
          // FIX: Check for user property before accessing it.
          if ('user' in result && result.user) {
            onLoginSuccess(result.user);
          }
      } else {
          setError(t(result.messageKey));
      }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const result = authService.login(email, password);
    handleAuthResult(result);
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const result = authService.register(email, password);
    handleAuthResult(result);
    if (result.success) {
      setMode('verify');
    }
  };
  
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const result = authService.verify(email, verifyCode);
    handleAuthResult(result);
     if (result.success) {
      setMode('login');
    }
  };
  
  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-cyan-400">{t('auth.registerTitle')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('auth.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">{t('auth.registerButton')}</button>
            <p className="text-center text-sm text-gray-400">
              {t('auth.hasAccount')} <button type="button" onClick={() => setMode('login')} className="font-semibold text-cyan-400 hover:underline">{t('auth.loginLink')}</button>
            </p>
          </form>
        );
      case 'verify':
        return (
           <form onSubmit={handleVerify} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-cyan-400">{t('auth.verifyTitle')}</h2>
            <p className="text-center text-sm text-gray-400">{t('auth.verifyPrompt')}</p>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('auth.email')}</label>
              <input type="email" value={email} readOnly className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('auth.verifyCode')}</label>
              <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">{t('auth.loginButton')}</button>
          </form>
        );
      case 'login':
      default:
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-cyan-400">{t('auth.loginTitle')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t('auth.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">{t('auth.loginButton')}</button>
            <p className="text-center text-sm text-gray-400">
              {t('auth.noAccount')} <button type="button" onClick={() => setMode('register')} className="font-semibold text-cyan-400 hover:underline">{t('auth.registerLink')}</button>
            </p>
             <div className="text-xs text-center text-gray-500 pt-4">
                <p>{t('auth.defaultAdmin')} <span className="font-mono">admin@pol.designer</span></p>
                <p>{t('auth.passwordLabel')} <span className="font-mono">admin123</span></p>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-cyan-400">{t('auth.mainTitle')}</h1>
        </div>
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl">
            {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
            {message && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-sm">{message}</p>}
            {renderForm()}
        </div>
    </div>
  );
};

export default AuthView;
