import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Briefcase, Building2, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['candidate', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer' | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword: _, ...payload } = data;
      await authApi.register(payload);
      toast({ title: 'Success', description: 'Check your email to verify your account.' });
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const selectRole = (role: 'candidate' | 'employer') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Create an account</h1>
        <p className="text-muted-foreground mt-2">
          {selectedRole ? 'Fill in your details to get started' : 'Choose how you want to use BRI HR Portal'}
        </p>
      </div>

      {!selectedRole ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button type="button" onClick={() => selectRole('candidate')} className="text-left">
            <Card className="h-full cursor-pointer border-2 border-transparent hover:border-[hsl(214,80%,52%)] hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-[hsl(214,80%,52%)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">Job Seeker</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Browse job openings, submit applications, and track your career progress
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center text-sm font-medium text-[hsl(214,80%,52%)]">
                    Get started &rarr;
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>

          <button type="button" onClick={() => selectRole('employer')} className="text-left">
            <Card className="h-full cursor-pointer border-2 border-transparent hover:border-[hsl(214,80%,52%)] hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-[hsl(214,80%,52%)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">Employer</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Post job openings, review candidates, and manage your hiring pipeline
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center text-sm font-medium text-[hsl(214,80%,52%)]">
                    Get started &rarr;
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to role selection
          </button>

          <Card className="border-2 border-[hsl(214,80%,52%)]/20">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  {selectedRole === 'candidate' ? (
                    <Briefcase className="h-5 w-5 text-[hsl(214,80%,52%)]" />
                  ) : (
                    <Building2 className="h-5 w-5 text-[hsl(214,80%,52%)]" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    {selectedRole === 'candidate' ? 'Job Seeker' : 'Employer'} Account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRole === 'candidate'
                      ? 'Find and apply to jobs'
                      : 'Post jobs and hire talent'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Min. 8 characters" {...register('password')} />
                  {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Retype your password" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <p className="text-sm text-center mt-4 text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="underline text-[hsl(214,80%,52%)] hover:text-primary">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedRole && (
        <p className="text-sm text-center mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline text-[hsl(214,80%,52%)] hover:text-primary">Sign in</Link>
        </p>
      )}
    </div>
  );
}
