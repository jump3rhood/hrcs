import { Outlet, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../recoil/authAtom';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/toaster';

export default function Layout() {
  const auth = useRecoilValue(authAtom);
  const location = useLocation();
  const role = auth.user?.role;

  const portalClass =
    role === 'admin' || location.pathname.startsWith('/admin')
      ? 'portal-admin'
      : role === 'employer'
      ? 'portal-employer'
      : 'portal-candidate';

  return (
    <div className={`min-h-screen bg-background ${portalClass}`}>
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
