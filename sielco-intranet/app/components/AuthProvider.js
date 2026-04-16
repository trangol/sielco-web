'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
      if (!session?.user && pathname !== '/login') {
        router.push('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user && pathname !== '/login') {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B2631', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}><span style={{ color: '#D84315' }}>S</span>IELCO</div>
          <div style={{ fontSize: '0.85rem', color: '#AEB6BF', marginTop: '0.5rem' }}>Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
