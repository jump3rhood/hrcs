import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '@/recoil/authAtom';
import api from '@/lib/axios';
import type { User } from '@/types';

export function useBootstrapAuth() {
  const setAuth = useSetRecoilState(authAtom);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get<User>('/auth/me').then((res) => {
      setAuth({ token, user: res.data });
    }).catch(() => {
      localStorage.removeItem('token');
      setAuth({ token: null, user: null });
    });
  }, [setAuth]);
}
