import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      
      {/* Dynamic Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-urgent/10 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between border-b border-border/40 bg-background/40 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary/20">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-ink">CareQueue</span>
          </div>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link to="/patient" className="text-sm font-semibold text-muted-foreground transition-all hover:text-ink hover:underline decoration-primary decoration-2 underline-offset-4">Patient Portal</Link>
            <Link to="/staff" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-ink/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/30">Staff Access</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-[1440px] px-6 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm shadow-primary/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Next-Gen Flow Management
            </div>
            
            <h1 className="font-display text-5xl leading-[1.1] tracking-tight text-ink sm:text-7xl lg:text-8xl">
              The future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-urgent">patient routing.</span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Eliminate crowded waiting rooms. CareQueue intelligently triages, manages live queues, and gives your patients exactly what they need: time and transparency.
            </p>
          </div>

          {/* Floating UI Mockups */}
          <div className="relative mx-auto mt-20 h-64 max-w-5xl sm:h-80">
            <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center gap-4">
              <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 transition-transform hover:-translate-y-2 duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Estimated Wait</div>
                  <div className="font-display text-2xl text-ink">14 min</div>
                </div>
              </div>
            </div>
            
            <div className="absolute left-1/4 top-12 hidden -translate-x-1/2 sm:block">
              <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 transition-transform hover:-translate-y-2 duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-urgent/20 text-urgent">
                  <span className="font-display text-xl">U</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Priority</div>
                  <div className="font-display text-xl text-ink">Urgent Track</div>
                </div>
              </div>
            </div>

            <div className="absolute right-1/4 top-16 hidden translate-x-1/2 sm:block">
              <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 transition-transform hover:-translate-y-2 duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                  <span className="font-display text-xl">4</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Position</div>
                  <div className="font-display text-xl text-ink">Ahead of you</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section className="relative border-t border-white/5 bg-surface/50 py-24 backdrop-blur-sm">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl text-ink sm:text-5xl">Choose your portal</h2>
              <p className="mt-4 text-muted-foreground">Log in to view your live status or manage the queue.</p>
            </div>
            
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:gap-10">
              {/* Patient Card */}
              <Link to="/patient" className="group relative flex flex-col items-start justify-between overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 p-10 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-card hover:shadow-2xl hover:shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="relative z-10">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <h3 className="font-display text-3xl text-ink">I am a Patient</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Check your live position in the queue, monitor your estimated wait time, and receive notifications the moment the doctor is ready for you.
                  </p>
                </div>
                
                <div className="relative z-10 mt-12 flex w-full items-center justify-between border-t border-border pt-6">
                  <span className="text-sm font-bold uppercase tracking-widest text-primary">Enter Waiting Room</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:translate-x-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </Link>

              {/* Staff Card */}
              <Link to="/staff" className="group relative flex flex-col items-start justify-between overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 p-10 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 hover:bg-card hover:shadow-2xl hover:shadow-accent/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="relative z-10">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 text-accent-foreground shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <h3 className="font-display text-3xl text-ink">Staff Access</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Access the provider console to seamlessly triage arrivals, monitor department capacity, and call patients from the smart queue.
                  </p>
                </div>

                <div className="relative z-10 mt-12 flex w-full items-center justify-between border-t border-border pt-6">
                  <span className="text-sm font-bold uppercase tracking-widest text-accent-foreground">Open Dashboard</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-foreground transition-transform duration-300 group-hover:translate-x-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Bento */}
        <section className="relative px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-16 text-center">
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Built for efficiency.</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 className="font-display text-2xl text-ink">Real-time sync</h4>
                <p className="mt-3 text-sm text-muted-foreground">WebSockets power instant updates across all displays, so wait times are always down to the second.</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-urgent/10 text-urgent">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h4 className="font-display text-2xl text-ink">Smart routing</h4>
                <p className="mt-3 text-sm text-muted-foreground">Dynamic urgency scoring automatically escalates critical cases without completely stalling routine visits.</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h4 className="font-display text-2xl text-ink">Insights & Analytics</h4>
                <p className="mt-3 text-sm text-muted-foreground">Visualize department bottlenecks and track staff efficiency with beautiful, built-in reporting dashboards.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background py-8 text-center backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          &copy; {new Date().getFullYear()} CareQueue Systems
        </p>
      </footer>
    </div>
  );
}
