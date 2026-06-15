const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { connectDB, isMongoConnected, readLocalDB, writeLocalDB } = require('./services/db');
const { User, Project, Decision, Issue, Document, AuditLog, AccessRequest } = require('./models');

// Configure environment configurations
require('dotenv').config();

const usersData = [
  {
    name: 'Administrator',
    email: 'admin@halbrain.com',
    password: 'admin123',
    role: 'Administrator',
    department: 'Information Technology',
    employeeId: 'admin',
    status: 'active',
    designation: 'Chief Information Officer',
    plainPassword: 'admin123'
  },
  {
    name: 'Dr. Vivek Murthy (PM-Avionics)',
    email: 'pm@hal-india.co.in',
    password: 'pm123',
    role: 'Project Manager',
    department: 'Avionics Division',
    employeeId: 'HAL-2026-0002',
    status: 'active',
    designation: 'Project Director',
    plainPassword: 'pm123'
  },
  {
    name: 'Sanjay Rawat (Lead Aerodynamics)',
    email: 'engineer@hal-india.co.in',
    password: 'eng123',
    role: 'Engineer',
    department: 'Design Division',
    employeeId: 'HAL-2026-0003',
    status: 'active',
    designation: 'Lead Aerodynamics Engineer',
    plainPassword: 'eng123'
  },
  {
    name: 'Kiran Bedi (Propulsion Systems)',
    email: 'employee@hal-india.co.in',
    password: 'emp123',
    role: 'Employee',
    department: 'Engine Division',
    employeeId: 'HAL-2026-0004',
    status: 'active',
    designation: 'Propulsion Specialist',
    plainPassword: 'emp123'
  },
  {
    name: 'Sub. Lt. Neha Sharma (Avionics)',
    email: 'tempuser@hal-india.co.in',
    password: 'TEMP-5678', // Temporary password
    role: 'Employee',
    department: 'Avionics Division',
    employeeId: 'HAL-2026-9090',
    status: 'pending_activation',
    designation: 'Junior Engineer',
    plainPassword: 'TEMP-5678'
  }
];

const accessRequestsData = [
  {
    name: 'Ramesh Singh (Helicopter Dynamics)',
    email: 'ramesh@hal-india.co.in',
    department: 'Helicopter Division',
    role: 'Engineer',
    reason: 'Need access to upload test flight telemetry logs.',
    status: 'pending'
  },
  {
    name: 'Priya Sharma (Engine Design)',
    email: 'priya@hal-india.co.in',
    department: 'Engine Division',
    role: 'Engineer',
    reason: 'Need access to check titanium nozzle stress reports.',
    status: 'pending'
  }
];

const projectsData = [
  {
    name: 'LCA Tejas Mk2 Design & Development',
    department: 'Design Division',
    startDate: '2025-01-15',
    endDate: '2028-12-30',
    projectManager: 'Dr. Vivek Murthy',
    status: 'Active',
    progressPercentage: 45,
    milestones: [
      { name: 'Wind Tunnel Calibration Testing', date: '2025-06-10', completed: true },
      { name: 'Avionics Prototype Mock Integration', date: '2026-02-15', completed: true },
      { name: 'Fuselage Structural Assembly Verification', date: '2026-10-01', completed: false },
      { name: 'First Technical Maiden Flight Rollout', date: '2027-05-18', completed: false }
    ],
    risks: [
      { title: 'Delays in Wing Composite Deliveries', severity: 'High', description: 'Supply chain friction for carbon fiber fabrics.', status: 'Identified' },
      { title: 'Radar Telemetry Calibration Shifts', severity: 'Medium', description: 'Small telemetry offset in thermal environments.', status: 'Mitigated' }
    ]
  },
  {
    name: 'Su-30 MKI Flight Computer Upgrade',
    department: 'Avionics Division',
    startDate: '2024-03-01',
    endDate: '2026-09-15',
    projectManager: 'Dr. Vivek Murthy',
    status: 'Delayed',
    progressPercentage: 80,
    milestones: [
      { name: 'Hardware interface card layout setup', date: '2024-08-01', completed: true },
      { name: 'Real-time OS boot testing', date: '2025-02-28', completed: true },
      { name: 'Cockpit telemetry display updates', date: '2025-11-10', completed: true },
      { name: 'Joint Air Force trial approval sign-off', date: '2026-04-10', completed: false }
    ],
    risks: [
      { title: 'FPGA Chip Allocation Shortage', severity: 'High', description: 'Global fab allocation queues backlog.', status: 'Active' }
    ]
  },
  {
    name: 'AMCA Fifth-Gen Stealth Fighter R&D',
    department: 'Research & Development',
    startDate: '2026-01-01',
    endDate: '2032-12-31',
    projectManager: 'Air Commodore Rajesh Sen',
    status: 'Active',
    progressPercentage: 12,
    milestones: [
      { name: 'RCS signature numerical modeling', date: '2026-05-01', completed: true },
      { name: 'Internal weapons bay release model', date: '2026-11-20', completed: false }
    ],
    risks: [
      { title: 'RAM Paint Coating Longevity', severity: 'High', description: 'Radar absorbent paint peeling at high temperatures.', status: 'Identified' }
    ]
  }
];

const decisionsData = [
  {
    title: 'Replacement of Primary Fly-by-Wire Supplier',
    projectName: 'LCA Tejas Mk2 Design & Development',
    department: 'Avionics Division',
    description: 'Terminate supplier contract with AeroSystems-A and award integration contract to Electronics-B for the digital cockpit computers.',
    reasoning: 'AeroSystems-A failed to meet MIL-STD-178C certification safety timelines for code coverage. Over 18 months of schedule slippage occurred. Electronics-B had already certified templates ready.',
    benefits: 'Recovers 6 months of prototype latency. Ensures fully compliant safety compliance certificates.',
    risks: 'Electronics-B requires hardware connector modifications, incurring a design revision cost of 2.4 Million INR.',
    supportingDocuments: ['AeroSystems_Timeline_Audit.pdf', 'ElectronicsB_Proposal_V3.pdf'],
    approvalStatus: 'Approved',
    createdBy: 'Dr. Vivek Murthy (PM-Avionics)',
    date: '2026-04-12'
  },
  {
    title: 'Adoption of Titanium Grade-5 for Nozzle Mount Assembly',
    projectName: 'Su-30 MKI Flight Computer Upgrade',
    department: 'Design Division',
    description: 'Switch mount components design standard from Aluminum 7075 alloy to Titanium Ti-6Al-4V (Grade-5).',
    reasoning: 'Thermal thermography scans on operational Sukhoi airframes demonstrated structural micro-cracks under load cycles exceeding 350 degrees C. Aluminum alloys lose load-carrying capacity at this range.',
    benefits: 'Triples nozzle mounting assembly life expectancy. Completely eliminates heat stress crack fatigue.',
    risks: 'Increases dry mass of the component by 14.5 kg. Requires precision electric-discharge machining (EDM) which increases machine shop hours.',
    supportingDocuments: ['Thermal_Stress_Report_Su30.pdf'],
    approvalStatus: 'Approved',
    createdBy: 'Sanjay Rawat (Lead Aerodynamics)',
    date: '2026-05-18'
  },
  {
    title: 'Divergent Nozzle Intake Grid Redesign',
    projectName: 'AMCA Fifth-Gen Stealth Fighter R&D',
    department: 'Research & Development',
    description: 'Re-angle stealth intake grid boundary layer diverters by negative 4.5 degrees.',
    reasoning: 'Initial computational fluid dynamics (CFD) mock tests indicated supersonic engine stalls at High Alpha angles of attack.',
    benefits: 'Maintains air flow stability. Decreases radar cross-section (RCS) signature return.',
    risks: 'Restricts maximum thrust performance by 1.2% in reheat mode.',
    supportingDocuments: ['AMCA_CFD_BoundaryLayer_Data.pdf'],
    approvalStatus: 'Pending',
    createdBy: 'Sanjay Rawat (Lead Aerodynamics)',
    date: '2026-06-02'
  }
];

const issuesData = [
  {
    title: 'Landing Gear Deployment Valve Pressure Drops',
    description: 'Telemetry alerts showing sudden 15% pressure drop in hydraulic loop line B-4 during continuous cycles test on test jig 8.',
    department: 'Design Division',
    priority: 'Critical',
    severity: 'Critical',
    status: 'In Progress',
    assignedTo: 'Sanjay Rawat (Lead Aerodynamics)',
    reportedBy: 'Kiran Bedi (Propulsion Systems)',
    rootCause: 'Elastomer seal erosion due to particulate contamination in the test rig fluid loop.',
    resolution: 'Flush fluid lines, install 3-micron absolute filters, and replace rubber seals with synthetic fluoropolymer seals.',
    attachments: ['Pressure_Log_Test8.xlsx'],
    slaAlertsSent: false
  },
  {
    title: 'Radar Target Tracking Drift in Thermographic Flights',
    description: 'Target tracking accuracy displays an azimuthal drift of 0.4 degrees when the radar nose cone structure heats above 75 degrees C.',
    department: 'Avionics Division',
    priority: 'High',
    severity: 'Major',
    status: 'Resolved',
    assignedTo: 'Dr. Vivek Murthy (PM-Avionics)',
    reportedBy: 'Sanjay Rawat (Lead Aerodynamics)',
    rootCause: 'Thermal expand coefficient mismatch on target board mount standoffs.',
    resolution: 'Replaced support standoffs with Invar-36 alloy brackets which have near-zero thermal expansion characteristics.',
    attachments: ['Azimuth_Drift_Graph.pdf'],
    slaAlertsSent: false
  },
  {
    title: 'Engine Afterburner Fuel Spurt Flutter',
    description: 'Unstable pressure pulsations observed during ground trials of HTT-40 engine block when throttling between military and reheat levels.',
    department: 'Engine Division',
    priority: 'Critical',
    severity: 'Blocker',
    status: 'Reported',
    assignedTo: 'Kiran Bedi (Propulsion Systems)',
    reportedBy: 'Sanjay Rawat (Lead Aerodynamics)',
    rootCause: '',
    resolution: '',
    attachments: [],
    slaAlertsSent: false
  }
];

async function seed(isManual = false) {
  if (!isMongoConnected()) {
    await connectDB();
  }
  const mongoActive = isMongoConnected();

  if (!isManual) {
    try {
      const existingUsers = await User.find({});
      if (existingUsers.length > 0) {
        console.log('Users already exist in database. Skipping automatic seeding.');
        return;
      }
    } catch (err) {
      console.error('Failed checking if users exist:', err);
    }
  }

  console.log('Starting seed operations...');

  if (mongoActive) {
    try {
      // Clear collections
      await UserMongoose.deleteMany({});
      await ProjectMongoose.deleteMany({});
      await DecisionMongoose.deleteMany({});
      await IssueMongoose.deleteMany({});
      await DocumentMongoose.deleteMany({});
      await AuditLogMongoose.deleteMany({});
      await AccessRequestMongoose.deleteMany({});
      console.log('MongoDB collections cleared.');
    } catch (err) {
      console.error('Failed clearing Mongo DB collections:', err);
    }
  } else {
    // Clear Local JSON DB by resetting fields to empty arrays
    const db = readLocalDB();
    db.users = [];
    db.projects = [];
    db.decisions = [];
    db.issues = [];
    db.documents = [];
    db.auditlogs = [];
    db.accessrequests = [];
    writeLocalDB(db);
    console.log('Local JSON DB reset.');
  }

  // 1. Seed Users
  const seededUsers = [];
  for (let u of usersData) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await User.create({
      ...u,
      password: hashedPassword
    });
    seededUsers.push(user);
    console.log(`Seeded user: ${user.name} (${user.role})`);
  }

  // 2. Seed Projects
  for (let p of projectsData) {
    const proj = await Project.create(p);
    console.log(`Seeded project: ${proj.name}`);
  }

  // 3. Seed Decisions
  for (let d of decisionsData) {
    const dec = await Decision.create(d);
    console.log(`Seeded decision: ${dec.title}`);
  }

  // 4. Seed Issues
  for (let i of issuesData) {
    const iss = await Issue.create(i);
    console.log(`Seeded issue: ${iss.title}`);
  }

  // 5. Seed Access Requests
  for (let ar of accessRequestsData) {
    const req = await AccessRequest.create(ar);
    console.log(`Seeded access request for: ${req.email}`);
  }

  // 6. Seed Documents
  // Create sample uploads directory & files
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sampleDocs = [
    { name: 'AeroSystems_Timeline_Audit.pdf', tag: 'Supplier, Audit, LCA' },
    { name: 'ElectronicsB_Proposal_V3.pdf', tag: 'Proposal, Contract, Cockpit' },
    { name: 'Thermal_Stress_Report_Su30.pdf', tag: 'Stress Analysis, Thermal, Sukhoi' },
    { name: 'Azimuth_Drift_Graph.pdf', tag: 'Radar, Testing, Avionics' }
  ];

  for (let fileInfo of sampleDocs) {
    const filePath = path.join(uploadsDir, fileInfo.name);
    // Write sample mock data to this file
    fs.writeFileSync(filePath, `HAL TECHNICAL ARCHIVE: ${fileInfo.name.toUpperCase()}\n-----------------------\nClassified document detailing ${fileInfo.tag}.\nGenerated for system verification.`, 'utf8');

    const doc = await Document.create({
      name: fileInfo.name,
      path: fileInfo.name,
      extension: 'PDF',
      uploader: 'Dr. Vivek Murthy (PM-Avionics)',
      tags: fileInfo.tag.split(',').map(s => s.trim()),
      size: 1024,
      version: '1.0.0',
      history: [{
        version: '1.0.0',
        path: fileInfo.name,
        date: new Date().toISOString(),
        uploader: 'Dr. Vivek Murthy (PM-Avionics)'
      }]
    });
    console.log(`Seeded Document File: ${doc.name}`);
  }

  // 7. Seed Audit Logs
  await AuditLog.create({
    userId: 'System',
    userName: 'HAL\'s BRAIN Seeder',
    action: 'Database Hydration',
    details: 'Successfully populated HAL\'s BRAIN workspace users, divisions, projects, access request logs, and issue tickets.',
    ipAddress: '127.0.0.1'
  });

  console.log('Database seeding successfully finished!');
  if (isManual) {
    process.exit(0);
  }
}

// Get models objects referenced in mongoose from schema definitions file
const mongoose = require('mongoose');
let UserMongoose, ProjectMongoose, DecisionMongoose, IssueMongoose, DocumentMongoose, AuditLogMongoose, AccessRequestMongoose;
if (mongoose.models.User) {
  UserMongoose = mongoose.models.User;
  ProjectMongoose = mongoose.models.Project;
  DecisionMongoose = mongoose.models.Decision;
  IssueMongoose = mongoose.models.Issue;
  DocumentMongoose = mongoose.models.Document;
  AuditLogMongoose = mongoose.models.AuditLog;
  AccessRequestMongoose = mongoose.models.AccessRequest;
} else {
  // If not declared, fallback loads schemas automatically through models index file
  const models = require('./models');
  UserMongoose = mongoose.models.User;
  ProjectMongoose = mongoose.models.Project;
  DecisionMongoose = mongoose.models.Decision;
  IssueMongoose = mongoose.models.Issue;
  DocumentMongoose = mongoose.models.Document;
  AuditLogMongoose = mongoose.models.AuditLog;
  AccessRequestMongoose = mongoose.models.AccessRequest;
}

if (require.main === module) {
  seed(true);
}

module.exports = { seed };
