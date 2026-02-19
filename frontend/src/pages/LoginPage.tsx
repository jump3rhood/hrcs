import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '@/recoil/authAtom';
import { authApi } from '@/api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Briefcase, Building2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

type LoginRole = 'candidate' | 'employer';
type WarnKind = 'wrong-role-employer' | 'wrong-role-candidate' | 'is-admin' | null;

export default function LoginPage() {
  const setAuth = useSetRecoilState(authAtom);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<LoginRole>('candidate');
  const [warnKind, setWarnKind] = useState<WarnKind>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleRoleChange = (role: LoginRole) => {
    setSelectedRole(role);
    setWarnKind(null);
  };

  const onSubmit = async (data: FormData) => {
    setWarnKind(null);
    try {
      const res = await authApi.login(data.email, data.password);
      const actualRole = res.data.user.role;

      if (actualRole === 'admin') {
        setWarnKind('is-admin');
        return;
      }
      if (actualRole !== selectedRole) {
        setWarnKind(actualRole === 'employer' ? 'wrong-role-employer' : 'wrong-role-candidate');
        return;
      }

      localStorage.setItem('token', res.data.token);
      setAuth({ token: res.data.token, user: res.data.user });
      if (actualRole === 'candidate') navigate('/candidate/jobs');
      else navigate('/employer/jobs');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Login failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 -my-6">
      <div className="min-h-[calc(100vh-57px)] flex flex-col lg:flex-row">
        {/* Image panel — visible on lg+ only */}
        <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80"
            alt="Team collaborating in a modern workspace"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,71%,25%)]/60 to-[hsl(214,80%,52%)]/30" />
          <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
            <h2 className="text-4xl font-bold leading-tight mb-3 drop-shadow-lg">
              Find the right talent.<br />Find the right job.
            </h2>
            <p className="text-white/90 text-lg max-w-md drop-shadow-md">
              BRI HR Portal connects top candidates with leading employers across India.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-12 lg:px-12 bg-background">
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
              <p className="text-muted-foreground mt-1">Sign in to your account</p>
            </div>

            {/* Role mismatch / admin warning */}
            {warnKind === 'wrong-role-employer' && (
              <div className="flex gap-2 items-start rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  This account is registered as an <strong>Employer</strong>. Please select{' '}
                  <button type="button" className="underline font-semibold" onClick={() => handleRoleChange('employer')}>
                    Employer
                  </button>{' '}
                  above, or{' '}
                  <Link to="/register" className="underline font-semibold">register a new Job Seeker account</Link>.
                </span>
              </div>
            )}
            {warnKind === 'wrong-role-candidate' && (
              <div className="flex gap-2 items-start rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  This account is registered as a <strong>Job Seeker</strong>. Please select{' '}
                  <button type="button" className="underline font-semibold" onClick={() => handleRoleChange('candidate')}>
                    Job Seeker
                  </button>{' '}
                  above, or{' '}
                  <Link to="/register" className="underline font-semibold">register a new Employer account</Link>.
                </span>
              </div>
            )}
            {warnKind === 'is-admin' && (
              <div className="flex gap-2 items-start rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Admin accounts must use the{' '}
                  <Link to="/admin/login" className="underline font-semibold">Admin Login portal</Link>.
                </span>
              </div>
            )}

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('candidate')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedRole === 'candidate'
                    ? 'border-[hsl(214,80%,52%)] bg-secondary text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-[hsl(214,80%,52%)]/40'
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('employer')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedRole === 'employer'
                    ? 'border-[hsl(214,80%,52%)] bg-secondary text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-[hsl(214,80%,52%)]/40'
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                Employer
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-[hsl(214,80%,52%)] underline hover:text-primary">
                Register
              </Link>
            </p>

            <p className="text-xs text-center text-muted-foreground">
              Admin?{' '}
              <Link to="/admin/login" className="text-[hsl(214,80%,52%)] underline hover:text-primary">
                Login here
              </Link>
            </p>

            {/* Tagline — visible on small/medium screens only */}
            <div className="lg:hidden pt-4 border-t text-center">
              <h2 className="text-lg font-bold text-primary leading-snug">
                Find the right talent. Find the right job.
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                BRI HR Portal connects top candidates with leading employers across India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
