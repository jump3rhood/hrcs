import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { authAtom } from '@/recoil/authAtom';
import { authApi } from '@/api/auth';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const { token, user } = useRecoilValue(authAtom);
  const setAuth = useSetRecoilState(authAtom);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (token && user && user.role === 'admin') return <Navigate to="/admin/candidates" replace />;
  const [notAdmin, setNotAdmin] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setNotAdmin(false);
    try {
      const res = await authApi.login(data.email, data.password);
      if (res.data.user.role !== 'admin') {
        setNotAdmin(true);
        return;
      }
      localStorage.setItem('token', res.data.token);
      setAuth({ token: res.data.token, user: res.data.user });
      navigate('/admin/candidates');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Login failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 -my-6">
      <div className="min-h-[calc(100vh-57px)] flex flex-col lg:flex-row">
        {/* Hero panel */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-[var(--portal-hero-bg)] flex-col items-center justify-center p-12 gap-6">
          <div className="flex flex-col items-center gap-4 text-white text-center">
            <div className="rounded-full bg-white/10 p-5 ring-2 ring-white/20">
              <ShieldCheck className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">Admin Portal</h2>
            <p className="text-white/80 text-lg max-w-sm">
              Restricted access for BRI HR Portal administrators only.
            </p>
          </div>
          <ul className="mt-6 space-y-3 text-white/70 text-sm max-w-xs w-full">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              Browse and filter all registered candidates
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              Invite matched candidates to job postings
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              Review applications and track invitation stats
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              Shortlist top candidates and notify employers
            </li>
          </ul>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-12 lg:px-12 bg-background">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--portal-hero-bg)] p-2">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Restricted to administrators</p>
              </div>
            </div>

            {notAdmin && (
              <div className="flex gap-2 items-start rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  This portal is for administrators only. Please use the{' '}
                  <Link to="/login" className="underline font-semibold">standard login page</Link>.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in as Admin'}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              Not an admin?{' '}
              <Link to="/login" className="text-accent underline hover:text-primary">
                Return to login
              </Link>
            </p>

            {/* Mobile tagline */}
            <div className="lg:hidden pt-4 border-t text-center space-y-1">
              <div className="flex justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-primary">Admin Portal</h2>
              <p className="text-muted-foreground text-sm">
                Restricted access for BRI HR Portal administrators only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
