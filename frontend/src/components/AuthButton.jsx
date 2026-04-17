import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthButton = ({ isScrolled }) => {
  const { user, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const googleEnabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition"
          aria-label="Cuenta"
        >
          {user.picture
            ? <img src={user.picture} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            : <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"><User size={16} /></div>}
          <span className={`hidden md:inline font-jakarta text-sm ${isScrolled ? 'text-brand-charcoal' : 'text-white'}`}>
            {user.name?.split(' ')[0] || 'Mi cuenta'}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-surface-200 overflow-hidden z-[60]">
            <div className="p-3 border-b border-surface-200">
              <p className="font-jakarta text-sm font-semibold truncate">{user.name}</p>
              <p className="font-jakarta text-xs text-brand-muted truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-100 transition text-left"
            >
              <LogOut size={16} /> Cerrar sesi\u00f3n
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!googleEnabled) {
    return (
      <span
        className={`hidden md:inline font-jakarta text-xs italic ${isScrolled ? 'text-brand-muted' : 'text-white/60'}`}
        title="Configur\u00e1 VITE_GOOGLE_CLIENT_ID para habilitar el login"
      >
        Login pendiente
      </span>
    );
  }

  return (
    <div className="flex items-center">
      <GoogleLogin
        onSuccess={async (resp) => {
          setError('');
          try {
            await signIn(resp.credential);
          } catch (e) {
            setError(e?.response?.data?.error || 'Error al iniciar sesi\u00f3n');
          }
        }}
        onError={() => setError('Error de Google')}
        size="medium"
        shape="pill"
        theme={isScrolled ? 'outline' : 'filled_black'}
        text="signin"
      />
      {error && <span className="ml-2 text-xs text-red-400">{error}</span>}
    </div>
  );
};

export default AuthButton;
