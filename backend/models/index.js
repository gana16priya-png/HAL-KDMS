const mongoose = require('mongoose');
const { getModel } = require('../services/db');

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Administrator', 'Project Manager', 'Engineer', 'Employee'], 
    default: 'Employee' 
  },
  department: { type: String, required: true },
  employeeId: { type: String, default: '' },
  status: { type: String, enum: ['pending_activation', 'active', 'deactivated'], default: 'active' },
  designation: { type: String, default: '' },
  phone: { type: String, default: '' },
  plainPassword: { type: String, default: '' }
}, { timestamps: true });

// --- ACCESS REQUEST SCHEMA ---
const accessRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true }, // division
  role: { type: String, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// --- PROJECT SCHEMA ---
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  projectManager: { type: String, required: true }, // Name or ID
  status: { 
    type: String, 
    enum: ['Not Started', 'Active', 'Completed', 'Delayed'], 
    default: 'Active' 
  },
  progressPercentage: { type: Number, default: 0 },
  milestones: [{
    name: { type: String, required: true },
    date: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  risks: [{
    title: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    description: { type: String },
    status: { type: String, enum: ['Identified', 'Mitigated', 'Active'], default: 'Identified' }
  }]
}, { timestamps: true });

// --- DECISION SCHEMA ---
const decisionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projectName: { type: String, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  reasoning: { type: String, required: true },
  benefits: { type: String, required: true },
  risks: { type: String, required: true },
  supportingDocuments: [{ type: String }],
  approvalStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  createdBy: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

// --- ISSUE SCHEMA ---
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  severity: { 
    type: String, 
    enum: ['Minor', 'Major', 'Critical', 'Blocker'], 
    default: 'Major' 
  },
  status: { 
    type: String, 
    enum: ['Reported', 'Assigned', 'In Progress', 'Under Review', 'Resolved', 'Closed'], 
    default: 'Reported' 
  },
  assignedTo: { type: String, default: '' },
  reportedBy: { type: String, required: true },
  rootCause: { type: String, default: '' },
  resolution: { type: String, default: '' },
  attachments: [{ type: String }],
  slaAlertsSent: { type: Boolean, default: false }
}, { timestamps: true });

// --- DOCUMENT SCHEMA ---
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  extension: { type: String, required: true },
  uploader: { type: String, required: true },
  tags: [{ type: String }],
  size: { type: Number, required: true },
  version: { type: String, default: '1.0.0' },
  history: [{
    version: { type: String },
    path: { type: String },
    date: { type: String },
    uploader: { type: String }
  }]
}, { timestamps: true });

// --- AUDIT LOG SCHEMA ---
const auditLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'Anonymous' },
  userName: { type: String, default: 'Anonymous User' },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
}, { timestamps: true });

// Register with mongoose
const UserMongoose = mongoose.model('User', userSchema);
const ProjectMongoose = mongoose.model('Project', projectSchema);
const DecisionMongoose = mongoose.model('Decision', decisionSchema);
const IssueMongoose = mongoose.model('Issue', issueSchema);
const DocumentMongoose = mongoose.model('Document', documentSchema);
const AuditLogMongoose = mongoose.model('AuditLog', auditLogSchema);
const AccessRequestMongoose = mongoose.model('AccessRequest', accessRequestSchema);

module.exports = {
  User: getModel('User', UserMongoose),
  Project: getModel('Project', ProjectMongoose),
  Decision: getModel('Decision', DecisionMongoose),
  Issue: getModel('Issue', IssueMongoose),
  Document: getModel('Document', DocumentMongoose),
  AuditLog: getModel('AuditLog', AuditLogMongoose),
  AccessRequest: getModel('AccessRequest', AccessRequestMongoose),
};
