import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employerApi } from '@/api/employers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EmployerProfilePage() {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    employerApi.getProfile().then((r) => {
      reset({
        companyName: r.data.companyName,
        industry: r.data.industry,
        website: r.data.website ?? '',
        description: r.data.description ?? '',
      });
    });
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    await employerApi.updateProfile(data);
    toast({ title: 'Profile saved' });
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input {...register('companyName')} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input {...register('industry')} placeholder="e.g. Technology, Finance…" />
            </div>
            <div>
              <Label>Website</Label>
              <Input {...register('website')} placeholder="https://…" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register('description')} rows={4} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
