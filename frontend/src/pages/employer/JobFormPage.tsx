import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { employerApi, type JobPayload } from '@/api/employers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  responsibilities: z.string().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  workMode: z.enum(['onsite', 'remote', 'hybrid']),
  location: z.string().optional(),
  experienceMin: z.coerce.number().int().min(0),
  experienceMax: z.coerce.number().int().min(0),
});
type FormData = z.infer<typeof schema>;

interface SkillEntry { skillName: string; required: boolean }

export default function EmployerJobFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(jobId);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { jobType: 'full-time', workMode: 'onsite', experienceMin: 0, experienceMax: 5 },
  });

  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newRequired, setNewRequired] = useState(true);

  useEffect(() => {
    if (isEdit && jobId) {
      employerApi.getJobs().then((r) => {
        const job = r.data.find((j) => j._id === jobId);
        if (job) {
          reset({
            title: job.title,
            description: job.description,
            responsibilities: job.responsibilities,
            jobType: job.jobType,
            workMode: job.workMode,
            location: job.location,
            experienceMin: job.experienceMin,
            experienceMax: job.experienceMax,
          });
          setSkills(job.skills ?? []);
        }
      });
    }
  }, [isEdit, jobId, reset]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills((prev) => [...prev.filter(s => s.skillName !== newSkill.trim()), { skillName: newSkill.trim(), required: newRequired }]);
    setNewSkill('');
  };

  const onSubmit = async (data: FormData) => {
    const payload: JobPayload = { ...data, skills };
    if (isEdit && jobId) {
      await employerApi.updateJob(jobId, payload);
      toast({ title: 'Job updated' });
    } else {
      await employerApi.createJob(payload);
      toast({ title: 'Job created as draft' });
    }
    navigate('/employer/jobs');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>{isEdit ? 'Edit Job' : 'Post a New Job'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Job Title</Label>
              <Input {...register('title')} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register('description')} rows={4} />
            </div>
            <div>
              <Label>Responsibilities</Label>
              <Textarea {...register('responsibilities')} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Type</Label>
                <Select value={watch('jobType')} onValueChange={(v) => setValue('jobType', v as FormData['jobType'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Work Mode</Label>
                <Select value={watch('workMode')} onValueChange={(v) => setValue('workMode', v as FormData['workMode'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input {...register('location')} placeholder="e.g. Lagos, Nigeria" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Experience (years)</Label>
                <Input type="number" {...register('experienceMin')} />
              </div>
              <div>
                <Label>Max Experience (years)</Label>
                <Input type="number" {...register('experienceMax')} />
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label>Required Skills</Label>
              <div className="flex gap-2 flex-wrap mt-2 mb-2">
                {skills.map((s) => (
                  <Badge key={s.skillName} variant={s.required ? 'default' : 'outline'} className="gap-1">
                    {s.skillName} {s.required ? '(required)' : '(preferred)'}
                    <button type="button" onClick={() => setSkills(prev => prev.filter(x => x.skillName !== s.skillName))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Skill name"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                />
                <Select value={newRequired ? 'required' : 'preferred'} onValueChange={(v) => setNewRequired(v === 'required')}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : isEdit ? 'Update Job' : 'Create Job'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employer/jobs')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
