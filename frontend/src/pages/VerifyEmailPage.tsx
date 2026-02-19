import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '@/recoil/authAtom';
import { authApi } from '@/api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const hasToken = Boolean(token);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(hasToken ? 'loading' : 'error');
  const [message, setMessage] = useState(hasToken ? '' : 'No verification token found.');
  const setAuth = useSetRecoilState(authAtom);
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;

    authApi.verifyEmail(token)
      .then((r) => {
        setStatus('success');
        setMessage((r.data as { message: string }).message);
        setAuth((prev) => prev.user
          ? { ...prev, user: { ...prev.user, isEmailVerified: true } }
          : prev
        );
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Verification failed.'
        );
      });
  }, [token, setAuth]);

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && <p>Verifying…</p>}
          {status === 'success' && (
            <>
              <p className="text-green-600">{message}</p>
              <Button asChild><Link to="/login">Go to Login</Link></Button>
            </>
          )}
          {status === 'error' && (
            <p className="text-destructive">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
