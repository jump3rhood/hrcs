import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authAtom } from '../recoil/authAtom';
import { Button } from '@/components/ui/button';
import { Bell, Menu, X, UserCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { employerApi } from '@/api/employers';
import { candidateApi } from '@/api/candidates';
import api from '@/lib/axios';

interface PopupNotification {
  _id: string;
  title: string;
  message: string;
  jobId?: string;
  isRead?: boolean;
}

export default function Navbar() {
  const [auth, setAuth] = useRecoilState(authAtom);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Employer notification dropdown
  const [employerDropdownOpen, setEmployerDropdownOpen] = useState(false);
  const [employerNotifications, setEmployerNotifications] = useState<PopupNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Candidate popup notifications (slide-in cards)
  const [popupNotifications, setPopupNotifications] = useState<PopupNotification[]>([]);
  const shownIds = useRef<Set<string>>(new Set());

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close employer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEmployerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Candidate: poll unread count + populate popup ──
  useEffect(() => {
    if (auth.user?.role !== 'candidate') return;
    const fetchAndPopup = () => {
      api.get<{ unread: number }>('/candidates/notifications/count')
        .then((r) => {
          setUnreadCount(r.data.unread);
          if (r.data.unread > 0) {
            candidateApi.getNotifications().then((nr) => {
              const unread = (nr.data as PopupNotification[]).filter(
                (n) => !n.isRead && !shownIds.current.has(n._id)
              );
              if (unread.length > 0) {
                unread.forEach((n) => shownIds.current.add(n._id));
                setPopupNotifications((prev) => {
                  const existing = new Set(prev.map((p) => p._id));
                  return [...prev, ...unread.filter((n) => !existing.has(n._id))].slice(-3);
                });
              }
            }).catch(() => {});
          }
        }).catch(() => {});
    };
    fetchAndPopup();
    const interval = setInterval(fetchAndPopup, 30000);
    return () => clearInterval(interval);
  }, [auth.user]);

  // ── Employer: poll unread count ──
  useEffect(() => {
    if (auth.user?.role !== 'employer') return;
    const fetchCount = () => {
      employerApi.getNotificationCount()
        .then((r) => setUnreadCount(r.data.unread))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [auth.user]);

  const openEmployerDropdown = () => {
    const opening = !employerDropdownOpen;
    setEmployerDropdownOpen(opening);
    if (opening) {
      employerApi.getNotifications()
        .then((r) => setEmployerNotifications((r.data as PopupNotification[]).slice(0, 5)))
        .catch(() => {});
    }
  };

  const handleEmployerNotifClick = async (n: PopupNotification) => {
    await employerApi.markNotificationRead(n._id).catch(() => {});
    setUnreadCount((c) => Math.max(0, c - 1));
    setEmployerDropdownOpen(false);
    if (n.jobId) navigate(`/employer/jobs/${n.jobId}/shortlist`);
    else navigate('/employer/notifications');
  };

  const dismissPopup = async (id: string) => {
    await candidateApi.markNotificationRead(id).catch(() => {});
    setPopupNotifications((prev) => prev.filter((n) => n._id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ user: null, token: null });
    navigate('/login');
  };

  const roleHome = () => {
    if (!auth.user) return '/';
    if (auth.user.role === 'candidate') return '/candidate/jobs';
    if (auth.user.role === 'employer') return '/employer/jobs';
    return '/admin/candidates';
  };

  // Active link styling helpers
  const navLink = (path: string) =>
    location.pathname.startsWith(path)
      ? 'text-sm text-white font-semibold underline underline-offset-4 decoration-white/50'
      : 'text-sm text-blue-100 hover:text-white transition-colors';

  const mobileNavLink = (path: string) =>
    `block px-4 py-2.5 text-sm rounded-md transition-colors ${
      location.pathname.startsWith(path)
        ? 'bg-white/15 text-white font-semibold'
        : 'text-blue-100 hover:text-white hover:bg-blue-800/50'
    }`;

  const isAuthPage = ['/login', '/register', '/admin/login'].includes(location.pathname);

  return (
    <>
      <nav className="border-b border-blue-900/30 bg-[hsl(217,71%,25%)] relative">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to={roleHome()} className="text-xl font-bold text-white">
            BRI HR Portal
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {auth.user?.role === 'candidate' && (
              <>
                <Link to="/candidate/jobs" className={navLink('/candidate/jobs')}>Browse Jobs</Link>
                <Link to="/candidate/applications" className={navLink('/candidate/applications')}>My Applications</Link>
                <Link to="/candidate/notifications" className="relative text-blue-100 hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {auth.user?.role === 'employer' && (
              <>
                <Link to="/employer/jobs" className={navLink('/employer/jobs')}>My Jobs</Link>
                {/* Employer bell + dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={openEmployerDropdown}
                    className="relative text-blue-100 hover:text-white transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {employerDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b flex items-center justify-between">
                        <span className="text-sm font-semibold">Notifications</span>
                        <Link
                          to="/employer/notifications"
                          onClick={() => setEmployerDropdownOpen(false)}
                          className="text-xs text-[hsl(214,80%,52%)] hover:underline"
                        >
                          View all
                        </Link>
                      </div>
                      {employerNotifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-4 py-3">No notifications yet.</p>
                      ) : (
                        employerNotifications.map((n) => (
                          <button
                            key={n._id}
                            type="button"
                            onClick={() => handleEmployerNotifClick(n)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                          >
                            <div className="flex items-start gap-2">
                              <UserCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium leading-snug">{n.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {auth.user?.role === 'admin' && (
              <>
                <Link to="/admin/candidates" className={navLink('/admin/candidates')}>Candidates</Link>
                <Link to="/admin/jobs" className={navLink('/admin/jobs')}>Jobs</Link>
              </>
            )}

            {auth.user ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-white border border-white/40 hover:bg-white/10 hover:text-white"
                onClick={logout}
              >
                Logout
              </Button>
            ) : !isAuthPage ? (
              <Link to="/login">
                <Button size="sm" className="bg-white text-[hsl(217,71%,25%)] hover:bg-blue-50">Login</Button>
              </Link>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-1.5 text-blue-100 hover:text-white transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-blue-800/50 px-2 py-3 space-y-1 bg-[hsl(217,71%,22%)]">
            {auth.user?.role === 'candidate' && (
              <>
                <Link to="/candidate/jobs" className={mobileNavLink('/candidate/jobs')}>Browse Jobs</Link>
                <Link to="/candidate/applications" className={mobileNavLink('/candidate/applications')}>My Applications</Link>
                <Link to="/candidate/notifications" className={mobileNavLink('/candidate/notifications')}>
                  <span className="flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{unreadCount}</span>
                    )}
                  </span>
                </Link>
              </>
            )}
            {auth.user?.role === 'employer' && (
              <>
                <Link to="/employer/jobs" className={mobileNavLink('/employer/jobs')}>My Jobs</Link>
                <Link to="/employer/notifications" className={mobileNavLink('/employer/notifications')}>
                  <span className="flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{unreadCount}</span>
                    )}
                  </span>
                </Link>
              </>
            )}
            {auth.user?.role === 'admin' && (
              <>
                <Link to="/admin/candidates" className={mobileNavLink('/admin/candidates')}>Candidates</Link>
                <Link to="/admin/jobs" className={mobileNavLink('/admin/jobs')}>Jobs</Link>
              </>
            )}
            <div className="px-4 pt-2">
              {auth.user ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-white border border-white/40 hover:bg-white/10 hover:text-white"
                  onClick={logout}
                >
                  Logout
                </Button>
              ) : !isAuthPage ? (
                <Link to="/login" className="block">
                  <Button size="sm" className="w-full bg-white text-[hsl(217,71%,25%)] hover:bg-blue-50">Login</Button>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </nav>

      {/* Candidate slide-in notification popups — fixed bottom-right */}
      {auth.user?.role === 'candidate' && popupNotifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {popupNotifications.map((n) => (
            <div
              key={n._id}
              className="pointer-events-auto bg-background border border-[hsl(214,80%,52%)]/30 rounded-lg shadow-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <UserCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissPopup(n._id)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => { dismissPopup(n._id); navigate('/candidate/notifications'); }}
                  className="text-xs text-[hsl(214,80%,52%)] hover:underline font-medium"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
