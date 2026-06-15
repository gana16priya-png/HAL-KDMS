import { 
  Plane, 
  Cpu, 
  Settings, 
  Globe, 
  Wrench, 
  Wind, 
  Hammer, 
  Factory, 
  ShieldAlert, 
  RefreshCw, 
  Compass, 
  ShieldCheck, 
  Layers, 
  ShoppingCart, 
  Users, 
  Server, 
  Coins, 
  Lightbulb 
} from 'lucide-react';

export const divisions = [
  {
    name: 'Aircraft Division',
    icon: Plane,
    color: {
      light: 'bg-blue-50 text-blue-600 border-blue-200/50',
      dark: 'bg-blue-950/30 text-blue-400 border-blue-800/30',
      glow: 'shadow-blue-500/10'
    },
    description: 'Design and assembly of fighter airframes and transport wings.',
    permissions: 'Full Engineering Access, Test telemetry uploading.'
  },
  {
    name: 'Helicopter Division',
    icon: Compass, // Lucide doesn't always have Copter in older versions, Compass/Plane fits nicely
    color: {
      light: 'bg-indigo-50 text-indigo-600 border-indigo-200/50',
      dark: 'bg-indigo-950/30 text-indigo-400 border-indigo-800/30',
      glow: 'shadow-indigo-500/10'
    },
    description: 'Rotary-wing aircraft research, testing, and production systems.',
    permissions: 'Full Engineering Access, Fleet maintenance tracking.'
  },
  {
    name: 'Engine Division',
    icon: Settings,
    color: {
      light: 'bg-rose-50 text-rose-600 border-rose-200/50',
      dark: 'bg-rose-950/30 text-rose-400 border-rose-800/30',
      glow: 'shadow-rose-500/10'
    },
    description: 'Gas turbine, turbojet, and propulsion technology manufacturing.',
    permissions: 'Core Engine Core telemetry, SLA escalation logs.'
  },
  {
    name: 'Aerospace Division',
    icon: Globe,
    color: {
      light: 'bg-sky-50 text-sky-600 border-sky-200/50',
      dark: 'bg-sky-950/30 text-sky-400 border-sky-800/30',
      glow: 'shadow-sky-500/10'
    },
    description: 'Satellites, rocket structures, and space-bound booster mounts.',
    permissions: 'Classified payload testing, CAD integration records.'
  },
  {
    name: 'Avionics Division',
    icon: Cpu,
    color: {
      light: 'bg-amber-50 text-amber-600 border-amber-200/50',
      dark: 'bg-amber-950/30 text-amber-400 border-amber-800/30',
      glow: 'shadow-amber-500/10'
    },
    description: 'Flight computers, real-time operating systems, and radar boards.',
    permissions: 'Hardware schematic edits, Source code repository.'
  },
  {
    name: 'Accessories Division',
    icon: Wrench,
    color: {
      light: 'bg-slate-100 text-slate-700 border-slate-200',
      dark: 'bg-slate-800/50 text-slate-300 border-slate-700/50',
      glow: 'shadow-slate-500/10'
    },
    description: 'Hydraulics, landing gears, and environmental control units.',
    permissions: 'Equipment valve pressure logs, Part specification.'
  },
  {
    name: 'Industrial & Marine Gas Turbine Division',
    icon: Wind,
    color: {
      light: 'bg-teal-50 text-teal-600 border-teal-200/50',
      dark: 'bg-teal-950/30 text-teal-400 border-teal-800/30',
      glow: 'shadow-teal-500/10'
    },
    description: 'Stationary power systems and navy engine auxiliary turbines.',
    permissions: 'Marine shaft torque databases, Plant telemetry logs.'
  },
  {
    name: 'Foundry & Forge Division',
    icon: Hammer,
    color: {
      light: 'bg-orange-50 text-orange-600 border-orange-200/50',
      dark: 'bg-orange-950/30 text-orange-400 border-orange-800/30',
      glow: 'shadow-orange-500/10'
    },
    description: 'Precision casting and heavy metal forging for critical stress mounts.',
    permissions: 'Metallurgical test reports, Stress crack data.'
  },
  {
    name: 'Aircraft Manufacturing Division',
    icon: Factory,
    color: {
      light: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
      dark: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30',
      glow: 'shadow-emerald-500/10'
    },
    description: 'Final structural integration and military factory line setups.',
    permissions: 'Production logs, Work-station status tracking.'
  },
  {
    name: 'Maintenance Repair & Overhaul (MRO)',
    icon: ShieldAlert,
    color: {
      light: 'bg-red-50 text-red-600 border-red-200/50',
      dark: 'bg-red-950/30 text-red-400 border-red-800/30',
      glow: 'shadow-red-500/10'
    },
    description: 'Field inspection, defect reporting, and active fleet maintenance.',
    permissions: 'Critical Defect logging, SLA ticket management.'
  },
  {
    name: 'Overhaul Division',
    icon: RefreshCw,
    color: {
      light: 'bg-purple-50 text-purple-600 border-purple-200/50',
      dark: 'bg-purple-950/30 text-purple-400 border-purple-800/30',
      glow: 'shadow-purple-500/10'
    },
    description: 'Airframe rebuilding and long-term lifespan extension overhauls.',
    permissions: 'Lifespan telemetry, Fatigue tracking certificates.'
  },
  {
    name: 'Design Division',
    icon: Lightbulb,
    color: {
      light: 'bg-cyan-50 text-cyan-600 border-cyan-200/50',
      dark: 'bg-cyan-950/30 text-cyan-400 border-cyan-800/30',
      glow: 'shadow-cyan-500/10'
    },
    description: 'Aerodynamic simulation, wind tunnel calibration, and conceptual designs.',
    permissions: 'CAD designs, Aerodynamics telemetry archives.'
  },
  {
    name: 'Quality Assurance',
    icon: ShieldCheck,
    color: {
      light: 'bg-green-50 text-green-600 border-green-200/50',
      dark: 'bg-green-950/30 text-green-400 border-green-800/30',
      glow: 'shadow-green-500/10'
    },
    description: 'Regulatory compliance auditing and safety certification processes.',
    permissions: 'Quality certificates validation, Audit sign-off.'
  },
  {
    name: 'Production',
    icon: Layers,
    color: {
      light: 'bg-violet-50 text-violet-600 border-violet-200/50',
      dark: 'bg-violet-950/30 text-violet-400 border-violet-800/30',
      glow: 'shadow-violet-500/10'
    },
    description: 'Shop floor component fabrication and materials assembly scheduling.',
    permissions: 'Material inventory control, Build routing schedule.'
  },
  {
    name: 'Procurement',
    icon: ShoppingCart,
    color: {
      light: 'bg-pink-50 text-pink-600 border-pink-200/50',
      dark: 'bg-pink-950/30 text-pink-400 border-pink-800/30',
      glow: 'shadow-pink-500/10'
    },
    description: 'Supplier contract management and raw alloy ordering coordination.',
    permissions: 'Vendor evaluations, Sourcing documents upload.'
  },
  {
    name: 'Human Resources',
    icon: Users,
    color: {
      light: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200/50',
      dark: 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-800/30',
      glow: 'shadow-fuchsia-500/10'
    },
    description: 'Staff allocation, technical transfers, and retirement record vaulting.',
    permissions: 'Organizational charting, Directory management.'
  },
  {
    name: 'Information Technology',
    icon: Server,
    color: {
      light: 'bg-cyan-50 text-cyan-700 border-cyan-200/50',
      dark: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/30',
      glow: 'shadow-cyan-500/10'
    },
    description: 'Platform servers setup, JWT auth, security protocols, and backups.',
    permissions: 'Full Infrastructure control, API logs access.'
  },
  {
    name: 'Finance',
    icon: Coins,
    color: {
      light: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
      dark: 'bg-yellow-950/30 text-yellow-400 border-yellow-800/30',
      glow: 'shadow-yellow-500/10'
    },
    description: 'Budget allocations, project expenditure reviews, and cost audits.',
    permissions: 'Expenditure charts, Cost tracking sheets.'
  },
  {
    name: 'Research & Development',
    icon: Lightbulb,
    color: {
      light: 'bg-lime-50 text-lime-700 border-lime-200/50',
      dark: 'bg-lime-950/30 text-lime-400 border-lime-850/30',
      glow: 'shadow-lime-500/10'
    },
    description: 'Next-generation stealth and hypersonic aviation technology research.',
    permissions: 'Fifth-Gen Stealth simulation, AI diagnostics.'
  }
];

export function getDivisionByName(name) {
  return divisions.find(d => d.name === name) || divisions[0];
}

export const divisionsList = divisions.map(d => d.name);
