import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';

interface TopSkill { skillName: string; rating: number }
interface CandidateRow {
  _id: string;
  firstName: string;
  lastName: string;
  location: string;
  yearsOfExperience: number;
  user: { email: string };
  topSkills: TopSkill[];
}

interface CandidatesResponse {
  candidates: CandidateRow[];
  total: number;
  page: number;
  pages: number;
}

export default function AdminCandidatesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<CandidatesResponse | null>(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [expMin, setExpMin] = useState('');
  const [expMax, setExpMax] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    const params: Record<string, string | number> = { page };
    if (skillsInput) params.skills = skillsInput;
    if (expMin) params.expMin = expMin;
    if (expMax) params.expMax = expMax;
    if (sort) params.sort = sort;
    adminApi.getCandidates(params).then((r) => setData(r.data as CandidatesResponse));
  }, [skillsInput, expMin, expMax, sort, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Candidate Pool</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end bg-muted/40 p-4 rounded-lg">
        <div>
          <Label>Skills (comma-separated)</Label>
          <Input
            placeholder="React, Node.js, Python"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-56"
          />
        </div>
        <div>
          <Label>Min Exp (yrs)</Label>
          <Input type="number" value={expMin} onChange={(e) => setExpMin(e.target.value)} className="w-24" />
        </div>
        <div>
          <Label>Max Exp (yrs)</Label>
          <Input type="number" value={expMax} onChange={(e) => setExpMax(e.target.value)} className="w-24" />
        </div>
        <div>
          <Label>Sort by</Label>
          <Select value={sort || 'default'} onValueChange={(v) => setSort(v === 'default' ? '' : v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Default" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setPage(1); load(); }}>Filter</Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {data ? `${data.total} candidates found — click any row to view full profile` : 'Loading…'}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Exp (yrs)</th>
              <th className="text-left p-3">Top Skills</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.candidates.map((c) => (
              <tr
                key={c._id}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/candidates/${c._id}`)}
              >
                <td className="p-3 font-medium text-primary">{c.firstName} {c.lastName}</td>
                <td className="p-3 text-muted-foreground">{c.user?.email}</td>
                <td className="p-3">{c.location || '—'}</td>
                <td className="p-3">{c.yearsOfExperience ?? '—'}</td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {c.topSkills?.map((s) => (
                      <Badge key={s.skillName} variant="secondary" className="text-xs">{s.skillName}</Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-xs text-primary whitespace-nowrap">
                    <ExternalLink className="h-3 w-3" />
                    View Profile
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <span className="self-center text-sm">Page {page} of {data.pages}</span>
          <Button variant="outline" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

    </div>
  );
}
