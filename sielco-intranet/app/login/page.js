'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales incorrectas');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1><span>S</span>IELCO</h1>
          <p>Intranet — Acceso restringido</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#AEB6BF', marginTop: '1.5rem' }}>
          SIELCO — Sistemas &amp; Soluciones
        </p>
      </div>
    </div>
  );
}
