import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateApi, type CandidateProfileWithSkills } from '@/api/candidates';
import type { CandidateSkill } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Star, Trash2 } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  yearsOfExperience: z.coerce.number().int().min(0),
  githubUrl: z.string().url().optional().or(z.literal('')),
});
type ProfileForm = z.infer<typeof profileSchema>;

function calcCompleteness(p: CandidateProfileWithSkills): number {
  const fields = [p.firstName, p.lastName, p.phone, p.location, p.bio, p.githubUrl];
  const filled = fields.filter(Boolean).length;
  const hasExp = p.yearsOfExperience > 0 ? 1 : 0;
  const hasSkills = p.skills.length > 0 ? 1 : 0;
  return Math.round(((filled + hasExp + hasSkills) / (fields.length + 2)) * 100);
}

export default function CandidateProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<CandidateProfileWithSkills | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newRating, setNewRating] = useState(3);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    candidateApi.getProfile().then((r) => {
      setProfile(r.data);
      reset({
        firstName: r.data.firstName,
        lastName: r.data.lastName,
        phone: r.data.phone,
        location: r.data.location,
        bio: r.data.bio,
        yearsOfExperience: r.data.yearsOfExperience,
        githubUrl: r.data.githubUrl ?? '',
      });
    });
  }, [reset]);

  const onSaveProfile = async (data: ProfileForm) => {
    const res = await candidateApi.updateProfile(data);
    setProfile(res.data);
    toast({ title: 'Profile saved' });
  };

  const onAddSkill = async () => {
    if (!newSkill.trim()) return;
    const res = await candidateApi.addSkill(newSkill.trim(), newRating);
    setProfile((prev) => prev ? { ...prev, skills: [...prev.skills.filter(s => s._id !== res.data._id), res.data] } : prev);
    setNewSkill('');
    setNewRating(3);
  };

  const onDeleteSkill = async (skill: CandidateSkill) => {
    await candidateApi.deleteSkill(skill._id);
    setProfile((prev) => prev ? { ...prev, skills: prev.skills.filter(s => s._id !== skill._id) } : prev);
  };

  const completeness = profile ? calcCompleteness(profile) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Profile</CardTitle>
            <div className="text-sm text-muted-foreground">
              Completeness: <span className="font-bold text-primary">{completeness}%</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input {...register('firstName')} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input {...register('lastName')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input {...register('phone')} />
              </div>
              <div>
                <Label>Location</Label>
                <Input {...register('location')} placeholder="City, Country" />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea {...register('bio')} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Years of Experience</Label>
                <Input type="number" min={0} {...register('yearsOfExperience')} />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input {...register('githubUrl')} placeholder="https://github.com/..." />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            {profile?.skills.map((skill) => (
              <div key={skill._id} className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
                <span className="text-sm">{skill.skillName}</span>
                <div className="flex">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`h-3 w-3 ${n <= skill.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <button onClick={() => onDeleteSkill(skill)} className="ml-1 text-destructive hover:opacity-80">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {profile?.skills.length === 0 && (
              <p className="text-muted-foreground text-sm">No skills added yet.</p>
            )}
          </div>
          <Separator />
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Skill Name</Label>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. React, Python…"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddSkill(); } }}
              />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setNewRating(n)}>
                    <Star className={`h-6 w-6 ${n <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={onAddSkill} type="button">Add</Button>
          </div>
          <div className="flex gap-1 mt-1">
            {['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'AWS'].map(s => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => setNewSkill(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
