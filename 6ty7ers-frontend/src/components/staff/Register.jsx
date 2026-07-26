import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost, apiGet, apiPut, apiDelete } from '../../service/api';

export default function RegisterStaff() {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Nurse');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [newDeptName, setNewDeptName] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
  
  const [staffList, setStaffList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editStaffId, setEditStaffId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');

  const isActive = (path) => location.pathname === path;

  const fetchData = async () => {
    try {
      const deptRes = await apiGet('/departments');
      setDepartments(deptRes);
      const staffRes = await apiGet('/staff_roster');
      setStaffList(staffRes);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  useEffect(() => {
    if (staff.role === 'Admin') {
      fetchData();
    }
  }, []);

  // Protect route
  if (staff.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive font-semibold">Access Denied: Admins only</div>
      </div>
    );
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiPost('/auth/register', {
        username,
        password,
        role,
        department_id: departmentId || undefined
      });
      setSuccess(`Successfully registered ${role}: ${username}`);
      setUsername('');
      setPassword('');
      setRole('Nurse');
      setDepartmentId('');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to register staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setDeptLoading(true);
    try {
      await apiPost('/departments', { name: newDeptName });
      setNewDeptName('');
      fetchData();
      setSuccess('Department created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create department');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('staff');
      navigate('/staff/login');
    }
  };

  const handleEditClick = (member) => {
    setEditStaffId(member.id);
    setEditRole(member.role);
    setEditDepartmentId(member.department_id || '');
  };

  const handleCancelEdit = () => {
    setEditStaffId(null);
    setEditRole('');
    setEditDepartmentId('');
  };

  const handleSaveEdit = async (id) => {
    try {
      await apiPut(`/staff_roster/${id}`, {
        role: editRole,
        department_id: editDepartmentId || null
      });
      setEditStaffId(null);
      fetchData();
      setSuccess('Staff member updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update staff');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await apiDelete(`/staff_roster/${id}`);
      fetchData();
      setSuccess('Staff member deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete staff');
    }
  };

  const initials = staff.username
    ? staff.username.substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden flex-col border-r border-border bg-surface lg:flex">
          <div className="flex items-center gap-2 p-5">
            <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <div>
              <div className="font-display text-xl leading-none text-ink">CareQueue</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</div>
            </div>
          </div>

          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
            <button onClick={() => navigate('/staff/dashboard')} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/dashboard') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </button>
            <button onClick={() => navigate('/staff/register')} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/register') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Register Staff
            </button>
          </nav>

          <div className="border-t border-border p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-ink hover:bg-secondary"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">Register Staff</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">Add new nurses and doctors</p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {initials}
              </div>
              <span className="text-xs font-semibold text-ink">{staff.username}</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                {staff.role}
              </span>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-md mx-auto mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-2xl text-ink">Create Account</h2>
              <p className="text-sm text-muted-foreground mt-1">Register a new staff member</p>

              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                    {success}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Doctor">Doctor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">No Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                    placeholder="e.g. doctor_smith"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>
            </div>

            <div className="max-w-md mx-auto mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-2xl text-ink">Add Department</h2>
              <p className="text-sm text-muted-foreground mt-1">Create a new department category</p>
              <form onSubmit={handleCreateDepartment} className="mt-6 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Department Name</label>
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                    placeholder="e.g. Cardiology"
                  />
                </div>
                <button
                  type="submit"
                  disabled={deptLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  {deptLoading ? 'Adding...' : 'Add Department'}
                </button>
              </form>
            </div>

            <div className="max-w-md mx-auto mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-2xl text-ink mb-4">Staff Roster</h2>
              {staffList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No staff members found.</p>
              ) : (
                <div className="space-y-4">
                  {staffList.map((member) => (
                    <div key={member.id} className="flex flex-col border-b border-border pb-3 last:border-0">
                      {editStaffId === member.id ? (
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm text-ink">{member.username}</p>
                            <span className="text-xs text-muted-foreground">Editing...</span>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="w-1/3 rounded-lg border border-border bg-background p-2 text-xs outline-none"
                            >
                              <option value="Nurse">Nurse</option>
                              <option value="Doctor">Doctor</option>
                            </select>
                            <select
                              value={editDepartmentId}
                              onChange={(e) => setEditDepartmentId(e.target.value)}
                              className="w-2/3 rounded-lg border border-border bg-background p-2 text-xs outline-none"
                            >
                              <option value="">No Department</option>
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 mt-1">
                            <button onClick={handleCancelEdit} className="text-xs font-semibold text-muted-foreground hover:text-ink">Cancel</button>
                            <button onClick={() => handleSaveEdit(member.id)} className="text-xs font-semibold text-primary hover:text-primary/80">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="font-semibold text-sm text-ink">{member.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {departments.find(d => d.id === member.department_id)?.name || 'No Department'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${member.role === 'Doctor' ? 'bg-primary/10 text-primary' : 'bg-accent/40 text-accent-foreground'}`}>
                              {member.role}
                            </span>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditClick(member)} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Edit</button>
                              <button onClick={() => handleDeleteStaff(member.id)} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Delete</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
