import { atom } from 'recoil';
import type { AuthState } from '../types';

export const authAtom = atom<AuthState>({
  key: 'authAtom',
  default: {
    user: null,
    token: localStorage.getItem('token'),
  },
});
