import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Cpu, ShieldCheck, Database, Sparkles, AlertTriangle, ArrowRight, Shield, Rocket } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Cognitive AI Assistant',
      description: 'Interact with organizational memory. Retrieve reasons for supplier swaps, testing anomalies, or CAD revisions directly from legacy archives.',
      icon: Sparkles,
      color: 'text-sky-400 bg-sky-950/40 border-sky-800/30'
    },
    {
      title: 'Smart SLA Issue Tracker',
      description: 'Log and monitor engineering defects. Auto-assign tickets by division and observe multi-tier SLA escalation countdowns in real-time.',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/30'
    },
    {
      title: 'Project Intelligence Dashboard',
      description: 'Aggregate structural health indices, milestone completions, and division performance indicators through interactive executive charts.',
      icon: Cpu,
      color: 'text-purple-400 bg-purple-950/40 border-purple-800/30'
    },
    {
      title: 'Decision Persistence Vault',
      description: 'Preserve institutional knowledge before engineers retire. Store core technical decisions, benefits, risks, and regulatory certificates in perpetuity.',
      icon: Database,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30'
    }
  ];

  const stats = [
    { label: 'Strategic Projects Tracked', val: '120+' },
    { label: 'Technical Decisions Persisted', val: '4,200+' },
    { label: 'Average Issue SLA Resolution', val: '98.7%' },
    { label: 'Technical Documents Vaulted', val: '15,000+' }
  ];

  // Generated particle stars array
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${12 + Math.random() * 15}s`,
    size: `${2 + Math.random() * 3}px`
  }));

  return (
    <div className="min-h-screen bg-hal-darkBg text-slate-100 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Embedded Styling for Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes particle {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          30% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 9s ease-in-out infinite;
        }
        .particle-star {
          position: absolute;
          background: rgba(56, 189, 248, 0.4);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
        }
      `}</style>

      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle-star"
            style={{
              left: p.left,
              bottom: '-20px',
              width: p.size,
              height: p.size,
              animation: `particle ${p.duration} linear infinite`,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>
      
      {/* Background Radial Glows */}
      <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0"></div>
      
      {/* Aerospace Grid lines background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      {/* Aerospace Schematic Outlines */}
      {/* Fighter Jet Silhouette Right */}
      <div className="absolute right-[6%] top-[18%] w-[320px] h-[320px] opacity-15 pointer-events-none animate-float z-0 hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.45" className="text-sky-400">
          <path d="M50,5 L54,32 L78,48 L78,53 L54,45 L54,78 L63,84 L63,87 L50,84 L37,87 L37,84 L46,78 L46,45 L22,53 L22,48 L46,32 Z" fill="none" stroke="currentColor" />
          <circle cx="50" cy="45" r="28" strokeDasharray="2 2" />
          <circle cx="50" cy="45" r="38" strokeDasharray="3 3" />
          <line x1="50" y1="2" x2="50" y2="92" strokeDasharray="1 3" />
          <line x1="8" y1="45" x2="92" y2="45" strokeDasharray="1 3" />
        </svg>
      </div>

      {/* Satellite Silhouette Left */}
      <div className="absolute left-[5%] bottom-[12%] w-[250px] h-[250px] opacity-10 pointer-events-none animate-float-reverse z-0 hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-blue-400">
          <rect x="42" y="42" width="16" height="16" rx="1" />
          <line x1="18" y1="50" x2="42" y2="50" strokeWidth="1.5" />
          <line x1="58" y1="50" x2="82" y2="50" strokeWidth="1.5" />
          <rect x="18" y="44" width="18" height="12" fill="none" />
          <line x1="27" y1="44" x2="27" y2="56" />
          <rect x="64" y="44" width="18" height="12" fill="none" />
          <line x1="73" y1="44" x2="73" y2="56" />
          <path d="M50,42 C50,32 42,26 36,26" />
          <line x1="32" y1="22" x2="38" y2="28" />
          <circle cx="32" cy="22" r="1" fill="currentColor" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-8 h-20 flex items-center justify-between border-b border-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-400/20">
            <Plane className="h-5.5 w-5.5 text-sky-400 rotate-45" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-widest uppercase text-white leading-none">Hindustan Aeronautics Limited</h1>
            <span className="text-[10px] text-sky-400 font-bold tracking-widest uppercase mt-1 block">Aerospace Defense Enterprise</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-sky-500/15 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Access Portal</span>
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-16 md:py-24 flex flex-col items-center text-center justify-center">
        
        {/* Aerospace Security Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/30 border border-sky-850/50 text-[10px] font-bold tracking-widest uppercase text-sky-400 mb-8">
          <Shield className="h-3.5 w-3.5" />
          <span>MIL-STD-178C Secure Organizational Memory</span>
        </div>

        {/* Brand Main Name & Tagline */}
        <div className="space-y-4">
          <h3 className="text-lg md:text-2xl font-black tracking-[0.2em] uppercase text-sky-400 block drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            Hindustan Aeronautics Limited
          </h3>
          <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none">
            HAL's <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.2)]">BRAIN</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 font-medium tracking-wide max-w-2xl mx-auto italic opacity-95">
            "The Digital Brain of Hindustan Aeronautics Limited"
          </p>
        </div>

        {/* Subtitle description */}
        <p className="mt-8 text-xs md:text-sm text-slate-400 max-w-2xl font-light leading-relaxed">
          Preserving Indian aerospace engineering history, testing telemetry, structural design logic, and critical flight equipment decisions in perpetuity. Ensuring continuity across organizational changes.
        </p>

        {/* Action buttons */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 group transition-all tracking-wider uppercase"
          >
            <span>Enter Secure Space</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Counter cards */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm shadow-xl">
              <div className="text-2xl md:text-3xl font-black text-white">{stat.val}</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features list */}
        <div id="features-sec" className="mt-32 w-full pt-16 border-t border-slate-900/60 text-left">
          <div className="max-w-xl mb-12">
            <h3 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider flex items-center gap-1.5">
              <Rocket className="h-4 w-4" />
              <span>Aeronautical Memory Engine</span>
            </h3>
            <h4 className="text-2xl md:text-3xl font-bold text-white mt-2">Enterprise Decision Integrity Modules</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 transition-all flex gap-5">
                  <div className={`p-3 rounded-xl ${feat.color} shrink-0 h-12 w-12 flex items-center justify-center border`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">{feat.title}</h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-8 h-16 flex items-center justify-between border-t border-slate-900/60 text-[9px] text-slate-500 font-semibold tracking-wider">
        <span>© 2026 HINDUSTAN AERONAUTICS LIMITED. ALL RIGHTS RESERVED.</span>
        <span>CLASSIFIED INTERNAL SECURITY PORTAL</span>
      </footer>

    </div>
  );
}
