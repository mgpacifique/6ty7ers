import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGet } from '../../service/api';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: staff.username || 'Staff',
    role: 'Nurse',
    department: 'General Medicine',
    patients: 412,
    onTimeRating: 94,
    rating: 4.9,
    hospital: 'Borcelle Hospital',
    hospitalBranch: 'Main Branch',
    shiftHours: '7:00 AM – 3:00 PM',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (staff.id) {
          const response = await apiGet(`/staff/${staff.id}`);
          setProfileData({
            name: response.full_name || staff.username || 'Staff',
            role: response.role || 'Nurse',
            department: response.department || 'General Medicine',
            patients: response.total_patients || 412,
            onTimeRating: response.on_time_rating || 94,
            rating: response.rating || 4.9,
            hospital: response.hospital || 'Borcelle Hospital',
            hospitalBranch: response.hospital_branch || 'Main Branch',
            shiftHours: response.shift_hours || '7:00 AM – 3:00 PM',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [staff.id]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('staff');
      navigate('/staff');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const avatarInitial = profileData.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
          <div className="flex items-center gap-2 p-5">
            <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <div>
              <div className="font-display text-xl leading-none text-ink">CareQueue</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Staff Console
              </div>
            </div>
          </div>

          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
            <button
              onClick={() => navigate('/staff/dashboard')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/dashboard')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </button>
            <button
              onClick={() => navigate('/staff/check-in')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/check-in')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Check-In
            </button>
            <button
              onClick={() => navigate('/staff/triage')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/triage')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Triage
            </button>
            <button
              onClick={() => navigate('/staff/reports')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/reports')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Reports
            </button>
            <button
              onClick={() => navigate('/staff/profile')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/profile')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </button>
          </nav>

          <div className="border-t border-border p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shift</div>
            <div className="mt-1 text-sm font-semibold text-ink">7:00 AM – 3:00 PM</div>
            <div className="text-xs text-muted-foreground">General Medicine</div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-ink hover:bg-secondary"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">Profile</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{profileData.role} · {profileData.department}</p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 md:flex">
              <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                placeholder="Search token, patient, doctor..."
                className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-primary/10 text-primary">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.251a.75.75 0 00.582.25H15m-4.5 0a.75.75 0 01-.582-.25H4.5m0 0l-.621 9.026A2.25 2.25 0 006.121 21h11.758a2.25 2.25 0 002.241-1.973l.621-9.026m-16.5 0h16.5m-1.5-6.75a6 6 0 11-12 0 6 6 0 0112 0z"></path>
              </svg>
              Live
            </div>

            <button className="rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-ink">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {avatarInitial}
              </div>
              <span className="text-xs font-semibold text-ink">{staff.username}</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                {profileData.role}
              </span>
            </div>
          </header>

          {/* Mobile Navigation */}
          <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-2 lg:hidden">
            <button
              onClick={() => navigate('/staff/dashboard')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/dashboard')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </button>
            <button
              onClick={() => navigate('/staff/check-in')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/check-in')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Check-In
            </button>
            <button
              onClick={() => navigate('/staff/triage')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/triage')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Triage
            </button>
            <button
              onClick={() => navigate('/staff/reports')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/reports')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Reports
            </button>
            <button
              onClick={() => navigate('/staff/profile')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </button>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mx-auto max-w-xl">
              {/* Profile Card */}
              <div className="rounded-3xl border border-border bg-card p-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {avatarInitial}
                </div>
                <h1 className="font-display mt-3 text-2xl text-ink">{profileData.name}</h1>
                <span className="mt-1 inline-block rounded-full bg-accent/40 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {profileData.role} · {profileData.department}
                </span>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-surface p-2">
                    <div className="font-display text-lg text-ink">{profileData.patients}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Patients</div>
                  </div>
                  <div className="rounded-xl bg-surface p-2">
                    <div className="font-display text-lg text-ink">{profileData.onTimeRating}%</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">On-time</div>
                  </div>
                  <div className="rounded-xl bg-surface p-2">
                    <div className="font-display text-lg text-ink">{profileData.rating}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Rating</div>
                  </div>
                </div>
              </div>

              {/* Settings List */}
              <div className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
                <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary transition">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-ink">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink">{profileData.hospital}</div>
                    <div className="text-xs text-muted-foreground">{profileData.hospitalBranch}</div>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary transition">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-ink">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink">Shift hours</div>
                    <div className="text-xs text-muted-foreground">{profileData.shiftHours}</div>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary transition">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-ink">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink">Notifications</div>
                    <div className="text-xs text-muted-foreground">On</div>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary transition">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-ink">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink">Account settings</div>
                    <div className="text-xs text-muted-foreground">Password, preferences</div>
                  </div>
                </button>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Sign out
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
