import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/api/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, MapPin, Briefcase, Star, Mail, Phone, Github, User } from 'lucide-react';

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

interface CandidateDetail extends CandidateRow {
  phone?: string;
  bio?: string;
  githubUrl?: string;
  skills: TopSkill[];
}

interface CandidatesResponse {
  candidates: CandidateRow[];
  total: number;
  page: number;
  pages: number;
}

export default function AdminCandidatesPage() {
  const [data, setData] = useState<CandidatesResponse | null>(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [expMin, setExpMin] = useState('');
  const [expMax, setExpMax] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  // Side panel
  const [panelCandidate, setPanelCandidate] = useState<CandidateDetail | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);

  const load = useCallback(() => {
    const params: Record<string, string | number> = { page };
    if (skillsInput) params.skills = skillsInput;
    if (expMin) params.expMin = expMin;
    if (expMax) params.expMax = expMax;
    if (sort) params.sort = sort;
    adminApi.getCandidates(params).then((r) => setData(r.data as CandidatesResponse));
  }, [skillsInput, expMin, expMax, sort, page]);

  useEffect(() => { load(); }, [load]);

  const openPanel = async (candidate: CandidateRow) => {
    setPanelLoading(true);
    setPanelCandidate(candidate as CandidateDetail);
    try {
      const res = await adminApi.getCandidateById(candidate._id);
      setPanelCandidate(res.data as CandidateDetail);
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => setPanelCandidate(null);

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
            </tr>
          </thead>
          <tbody>
            {data?.candidates.map((c) => (
              <tr
                key={c._id}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => openPanel(c)}
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

      {/* Candidate detail side panel */}
      {panelCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={closePanel} />
          {/* Panel */}
          <div className="w-full max-w-md bg-background border-l shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-base leading-tight">
                    {panelCandidate.firstName} {panelCandidate.lastName}
                  </h2>
                  {panelCandidate.yearsOfExperience != null && (
                    <p className="text-xs text-muted-foreground">{panelCandidate.yearsOfExperience} yrs experience</p>
                  )}
                </div>
              </div>
              <button type="button" onClick={closePanel} className="text-muted-foreground hover:text-foreground p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {panelLoading && !panelCandidate.skills ? (
                <p className="text-sm text-muted-foreground">Loading profile…</p>
              ) : (
                <>
                  {/* Contact */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{panelCandidate.user?.email}</span>
                      </div>
                      {panelCandidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{panelCandidate.phone}</span>
                        </div>
                      )}
                      {panelCandidate.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{panelCandidate.location}</span>
                        </div>
                      )}
                      {panelCandidate.githubUrl && (
                        <div className="flex items-center gap-2">
                          <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <a
                            href={panelCandidate.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {panelCandidate.githubUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Experience */}
                  <section className="space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{panelCandidate.yearsOfExperience ?? '—'} years</span>
                    </div>
                  </section>

                  {/* Bio */}
                  {panelCandidate.bio && (
                    <section className="space-y-1.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{panelCandidate.bio}</p>
                    </section>
                  )}

                  {/* Skills */}
                  {panelCandidate.skills && panelCandidate.skills.length > 0 && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Skills ({panelCandidate.skills.length})
                      </h3>
                      <div className="space-y-2">
                        {panelCandidate.skills.map((s) => (
                          <div key={s.skillName} className="flex items-center justify-between py-1 border-b border-muted last:border-0">
                            <span className="text-sm font-medium">{s.skillName}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < s.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'}`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
