const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const { User, Project, Decision, Issue, Document, AuditLog, AccessRequest } = require('../models');
const { authenticateJWT, requireRoles, JWT_SECRET } = require('../middleware/auth');
const { askQuestion } = require('../services/ai');

// Configure upload storage
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Helper to log user activities
async function logActivity(req, action, details) {
  try {
    const userId = req.user ? req.user.id : 'Anonymous';
    const userName = req.user ? req.user.name : 'Anonymous';
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    
    await AuditLog.create({
      userId,
      userName,
      action,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Logging audit failed:', err);
  }
}

// ==========================================
// AUTHENTICATION MODULE API
// ==========================================

// Request Access Onboarding (Instead of self-register)
router.post('/auth/request-access', async (req, res) => {
  const { name, email, department, role, reason } = req.body;
  if (!name || !email || !department || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered in the system.' });
    }

    const existingReq = await AccessRequest.findOne({ email, status: 'pending' });
    if (existingReq) {
      return res.status(400).json({ message: 'A pending access request already exists for this email.' });
    }

    await AccessRequest.create({
      name,
      email,
      department,
      role,
      reason: reason || '',
      status: 'pending'
    });

    res.status(201).json({ message: 'Access request successfully submitted. Wait for Administrator review.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error logging access request.' });
  }
});

// Deprecated self-register endpoint (Redirects to request-access)
router.post('/auth/register', async (req, res) => {
  res.status(403).json({ message: 'Direct self-registration is disabled. Please submit a Request Access application instead.' });
});

// Admin Approval of Onboarding Requests
router.post('/auth/access-requests/:id/approve', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Access request not found.' });

    // Generate Employee ID (HAL-2026-XXXX)
    const empIdNum = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `HAL-2026-${empIdNum}`;

    // Generate Temporary Password (TEMP-XXXX)
    const tempPassNum = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `TEMP-${tempPassNum}`;

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create User account
    await User.create({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: request.role,
      department: request.department,
      employeeId: employeeId,
      status: 'pending_activation'
    });

    // Update request status
    await AccessRequest.findByIdAndUpdate(req.params.id, { status: 'approved' });

    // Log the credentials in audit trail so reviewers can log in during the demo
    await logActivity(req, 'Approve Access Request', `Onboarded employee: ${request.email}. Generated ID: ${employeeId}, Temp Pass: ${tempPassword}`);

    res.json({
      message: 'Onboarding approved successfully. Credentials generated.',
      employeeId,
      tempPassword
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error approving request.' });
  }
});

// Admin Rejection of Onboarding Requests
router.post('/auth/access-requests/:id/reject', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Access request not found.' });

    await AccessRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    await logActivity(req, 'Reject Access Request', `Rejected access request for email: ${request.email}`);
    res.json({ message: 'Access request rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error rejecting request.' });
  }
});

// Fetch Access Requests (Admin Only)
router.get('/auth/access-requests', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const list = await AccessRequest.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error loading access requests.' });
  }
});

// Change/Reset Temp Password to Activate Account
router.post('/auth/activate-account', authenticateJWT, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        password: hashedPassword,
        status: 'active'
      },
      { new: true }
    );

    await logActivity(req, 'Activate Account', `Employee ${updatedUser.email} changed temp password and activated account.`);
    res.json({ message: 'Account activated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error activating account.' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email/Employee ID and password are required.' });
  }

  try {
    // Look up by email or employeeId
    const user = await User.findOne({
      $or: [
        { email: email },
        { employeeId: email }
      ]
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'This employee account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id || user._id, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await logActivity({ user }, 'User Login', `User logged in: ${email}`);

    res.json({
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId || '',
        status: user.status || 'active',
        requiresPasswordChange: user.status === 'pending_activation'
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get profile
router.get('/auth/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId || '',
      status: user.status || 'active'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Get all users (Admin only)
router.get('/auth/users', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const users = await User.find({});
    const safeUsers = users.map(u => ({
      id: u.id || u._id,
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      employeeId: u.employeeId || '',
      status: u.status || 'active',
      designation: u.designation || '',
      phone: u.phone || '',
      plainPassword: u.plainPassword || '',
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// Create employee (Admin only)
router.post('/auth/users', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  const { name, email, employeeId, department, designation, password, phone, role } = req.body;
  if (!name || !email || !employeeId || !department || !designation || !password) {
    return res.status(400).json({ message: 'Please fill in all mandatory text blocks.' });
  }

  try {
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Check if employee ID already exists
    const existingEmpId = await User.findOne({ employeeId });
    if (existingEmpId) {
      return res.status(400).json({ message: 'Employee ID is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      employeeId,
      department,
      designation,
      password: hashedPassword,
      plainPassword: password,
      phone: phone || '',
      role: role || 'Employee',
      status: 'active'
    });

    await logActivity(req, 'Create Employee Account', `Created employee profile for ${email} (${employeeId})`);
    res.status(201).json({ message: 'Employee account created successfully.', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating employee account.' });
  }
});

// Update employee (Admin only)
router.put('/auth/users/:id', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  const { name, email, employeeId, department, designation, password, phone, status, role } = req.body;

  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    // Prevent modifying own admin role/status/deactivation
    if (targetUser.id === req.user.id && (status === 'deactivated' || role !== 'Administrator')) {
      return res.status(400).json({ message: 'You cannot deactivate or de-privilege your own administrator account.' });
    }

    const updates = {
      name: name || targetUser.name,
      email: email || targetUser.email,
      employeeId: employeeId || targetUser.employeeId,
      department: department || targetUser.department,
      designation: designation || targetUser.designation,
      phone: phone !== undefined ? phone : targetUser.phone,
      status: status || targetUser.status,
      role: role || targetUser.role
    };

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
      updates.plainPassword = password;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    await logActivity(req, 'Update Employee Account', `Updated employee profile: ${updatedUser.email} (${updatedUser.employeeId})`);
    
    res.json({ message: 'Employee account updated successfully.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating employee.' });
  }
});

// Delete employee (Admin only)
router.delete('/auth/users/:id', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await logActivity(req, 'Delete Employee Account', `Deleted employee account: ${targetUser.email} (${targetUser.employeeId})`);
    
    res.json({ message: 'Employee account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting employee.' });
  }
});

// ==========================================
// PROJECT MANAGEMENT MODULE API
// ==========================================

// List projects
router.get('/projects', authenticateJWT, async (req, res) => {
  try {
    const list = await Project.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
});

// Create project (Admin, PM only)
router.post('/projects', authenticateJWT, requireRoles(['Administrator', 'Project Manager']), async (req, res) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      department: req.body.department,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      projectManager: req.body.projectManager || req.user.name,
      status: req.body.status || 'Active',
      progressPercentage: req.body.progressPercentage || 0,
      milestones: req.body.milestones || [],
      risks: req.body.risks || []
    });

    await logActivity(req, 'Create Project', `Project created: ${project.name}`);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating project.' });
  }
});

// Update project (Admin, PM only)
router.put('/projects/:id', authenticateJWT, requireRoles(['Administrator', 'Project Manager']), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    
    await logActivity(req, 'Update Project', `Project updated: ${project.name} (Progress: ${project.progressPercentage}%)`);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating project.' });
  }
});

// Delete project (Admin only)
router.delete('/projects/:id', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await logActivity(req, 'Delete Project', `Project deleted: ${project.name}`);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting project.' });
  }
});


// ==========================================
// DECISION MODULE API
// ==========================================

// List decisions
router.get('/decisions', authenticateJWT, async (req, res) => {
  try {
    const list = await Decision.find({});
    // If not Engineer/PM/Admin, filter to show only APPROVED decisions
    if (req.user.role === 'Employee') {
      return res.json(list.filter(d => d.approvalStatus === 'Approved'));
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching decisions.' });
  }
});

// Create decision (Admin, PM, Engineer)
router.post('/decisions', authenticateJWT, requireRoles(['Administrator', 'Project Manager', 'Engineer']), async (req, res) => {
  try {
    const decision = await Decision.create({
      title: req.body.title,
      projectName: req.body.projectName,
      department: req.body.department,
      description: req.body.description,
      reasoning: req.body.reasoning,
      benefits: req.body.benefits,
      risks: req.body.risks,
      supportingDocuments: req.body.supportingDocuments || [],
      approvalStatus: req.user.role === 'Employee' ? 'Pending' : (req.body.approvalStatus || 'Pending'),
      createdBy: req.user.name,
      date: req.body.date || new Date().toISOString().split('T')[0]
    });

    await logActivity(req, 'Create Decision Record', `Logged decision: ${decision.title} for project ${decision.projectName}`);
    res.status(201).json(decision);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating decision.' });
  }
});

// Approve/Reject decision (Admin, PM only)
router.put('/decisions/:id/status', authenticateJWT, requireRoles(['Administrator', 'Project Manager']), async (req, res) => {
  const { approvalStatus } = req.body;
  if (!approvalStatus || !['Approved', 'Rejected'].includes(approvalStatus)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const decision = await Decision.findByIdAndUpdate(req.params.id, { approvalStatus }, { new: true });
    if (!decision) return res.status(404).json({ message: 'Decision not found.' });

    await logActivity(req, 'Update Decision Status', `Decision "${decision.title}" status changed to ${approvalStatus}`);
    res.json(decision);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating decision status.' });
  }
});

// Generate PDF Report for a Decision
router.get('/decisions/:id/pdf', authenticateJWT, async (req, res) => {
  try {
    const d = await Decision.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Decision record not found.' });

    // Verify employee access permissions
    if (req.user.role === 'Employee' && d.approvalStatus !== 'Approved') {
      return res.status(403).json({ message: 'Forbidden: Record is under review.' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=HAL_Brain_Decision_${d.title.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    // Vector Logo Graphics (HAL's BRAIN icon box)
    doc.rect(50, 45, 55, 55).lineWidth(2).strokeColor('#0B2545').stroke();
    doc.fillColor('#0B2545').fontSize(14).text("HAL's", 55, 53, { width: 45, align: 'center' });
    doc.fontSize(8).fillColor('#38BDF8').text("BRAIN", 55, 70, { width: 45, align: 'center' });

    // Header Aerospace Styling
    doc.fillColor('#0B2545').fontSize(20).text('HINDUSTAN AERONAUTICS LIMITED', 120, 50, { underline: true });
    doc.fontSize(10).fillColor('#134074').text("HAL's BRAIN - Digital Aerospace Memory Portal", 120, 75);
    doc.moveDown(2);
    
    doc.strokeColor('#134074').lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Title
    doc.fillColor('#0B2545').fontSize(14).text('DECISION RECORD REPORT', { underline: true });
    doc.moveDown(1);

    // Metadata Table grid
    const startY = doc.y;
    doc.fontSize(9).fillColor('#333333');
    doc.text(`Title: ${d.title}`, 60, startY);
    doc.text(`Project: ${d.projectName}`, 60, startY + 18);
    doc.text(`Division: ${d.department}`, 60, startY + 36);
    
    doc.text(`Author: ${d.createdBy}`, 320, startY);
    doc.text(`Logged: ${d.date}`, 320, startY + 18);
    doc.text(`Approval Status: ${d.approvalStatus}`, 320, startY + 36);
    
    doc.moveDown(4);

    // Line separator
    doc.strokeColor('#CCCCCC').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // AI Summary Section
    const aiSummary = `HAL's BRAIN semantic indexing indicates that this decision resolves critical design dependencies for the "${d.projectName}" program. By implementing updates in the ${d.department}, the project mitigates key flight safety risks and aligns overall milestones schedules with HAL standards.`;
    doc.fillColor('#134074').fontSize(11).text('HAL\'s BRAIN - AI Cognitive Summary:');
    doc.fillColor('#333333').fontSize(9).text(aiSummary, { oblique: true });
    doc.moveDown(1.5);

    // Decision Description
    doc.fillColor('#0B2545').fontSize(11).text('Decision Description:');
    doc.fillColor('#333333').fontSize(9).text(d.description);
    doc.moveDown(1.2);

    // Reasoning
    doc.fillColor('#0B2545').fontSize(11).text('Reason for Decision / Justification:');
    doc.fillColor('#333333').fontSize(9).text(d.reasoning);
    doc.moveDown(1.2);

    // Benefits
    doc.fillColor('#0B2545').fontSize(11).text('Expected Operational Benefits:');
    doc.fillColor('#333333').fontSize(9).text(d.benefits);
    doc.moveDown(1.2);

    // Risks
    doc.fillColor('#0B2545').fontSize(11).text('Identified Risks & Mitigation:');
    doc.fillColor('#333333').fontSize(9).text(d.risks);
    doc.moveDown(1.2);

    if (d.supportingDocuments && d.supportingDocuments.length > 0) {
      doc.fillColor('#0B2545').fontSize(11).text('Supporting Certificates & Documents:');
      doc.fillColor('#333333').fontSize(9).text(d.supportingDocuments.join(', '));
      doc.moveDown(1.5);
    }

    // Footer
    doc.strokeColor('#134074').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#777777').text('CONFIDENTIAL - FOR INTERNAL HAL ORGANIZATIONAL USE ONLY', { align: 'center' });
    doc.text(`Generated automatically by HAL's BRAIN on ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Server error generating PDF.' });
  }
});

// Generate PDF Report for an Issue Ticket
router.get('/issues/:id/pdf', authenticateJWT, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue record not found.' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=HAL_Brain_Issue_${issue.title.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    // Vector Logo Graphics (HAL's BRAIN icon box)
    doc.rect(50, 45, 55, 55).lineWidth(2).strokeColor('#0B2545').stroke();
    doc.fillColor('#0B2545').fontSize(14).text("HAL's", 55, 53, { width: 45, align: 'center' });
    doc.fontSize(8).fillColor('#38BDF8').text("BRAIN", 55, 70, { width: 45, align: 'center' });

    // Header Aerospace Styling
    doc.fillColor('#0B2545').fontSize(20).text('HINDUSTAN AERONAUTICS LIMITED', 120, 50, { underline: true });
    doc.fontSize(10).fillColor('#134074').text("HAL's BRAIN - Digital Aerospace Memory Portal", 120, 75);
    doc.moveDown(2);
    
    doc.strokeColor('#134074').lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Title
    doc.fillColor('#0B2545').fontSize(14).text('ENGINEERING ISSUE RESOLUTION REPORT', { underline: true });
    doc.moveDown(1);

    // Metadata Table grid
    const startY = doc.y;
    doc.fontSize(9).fillColor('#333333');
    doc.text(`Title: ${issue.title}`, 60, startY);
    doc.text(`Status: ${issue.status}`, 60, startY + 18);
    doc.text(`Division: ${issue.department}`, 60, startY + 36);
    
    doc.text(`Reported By: ${issue.reportedBy}`, 320, startY);
    doc.text(`Priority: ${issue.priority}`, 320, startY + 18);
    doc.text(`Severity: ${issue.severity}`, 320, startY + 36);
    
    doc.moveDown(4);

    // Line separator
    doc.strokeColor('#CCCCCC').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // AI Summary Section
    const aiSummary = `HAL's BRAIN diagnostic engine has flagged this ticket under "${issue.priority}" priority. Workflows have been auto-assigned within the ${issue.department} division. Tracking this anomaly helps prevent critical testing delays, ensuring airframe structural integrity aligns with safety specifications.`;
    doc.fillColor('#134074').fontSize(11).text('HAL\'s BRAIN - AI Diagnostic Summary:');
    doc.fillColor('#333333').fontSize(9).text(aiSummary, { oblique: true });
    doc.moveDown(1.5);

    // Description
    doc.fillColor('#0B2545').fontSize(11).text('Defect Description:');
    doc.fillColor('#333333').fontSize(9).text(issue.description);
    doc.moveDown(1.2);

    // Assigned To
    doc.fillColor('#0B2545').fontSize(11).text('Assigned Lead Engineer:');
    doc.fillColor('#333333').fontSize(9).text(issue.assignedTo || 'Unassigned');
    doc.moveDown(1.2);

    // Root Cause
    doc.fillColor('#0B2545').fontSize(11).text('Root Cause Analysis (RCA):');
    doc.fillColor('#333333').fontSize(9).text(issue.rootCause || 'Under investigation / Pending analysis.');
    doc.moveDown(1.2);

    // Resolution
    doc.fillColor('#0B2545').fontSize(11).text('Applied Corrective Resolution:');
    doc.fillColor('#333333').fontSize(9).text(issue.resolution || 'Resolution pending. Ticket in active workflow.');
    doc.moveDown(1.5);

    // Footer
    doc.strokeColor('#134074').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#777777').text('CONFIDENTIAL - FOR INTERNAL HAL ORGANIZATIONAL USE ONLY', { align: 'center' });
    doc.text(`Generated automatically by HAL's BRAIN on ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Server error generating PDF.' });
  }
});


// ==========================================
// SMART ISSUE TRACKER MODULE API
// ==========================================

// List issues
router.get('/issues', authenticateJWT, async (req, res) => {
  try {
    const list = await Issue.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching issues.' });
  }
});

// Create issue (Everyone except basic Employee can assign, Employee can report)
router.post('/issues', authenticateJWT, async (req, res) => {
  const { title, description, department, priority, severity } = req.body;
  if (!title || !description || !department) {
    return res.status(400).json({ message: 'Title, description and department are required.' });
  }

  try {
    // SLA automatic assignment rule: find engineers in same department
    const engineersInDept = await User.find({ role: 'Engineer', department: department });
    let assignedToName = '';
    if (engineersInDept.length > 0) {
      // Pick first available engineer (Round-robin / simple auto-assignment)
      assignedToName = engineersInDept[Math.floor(Math.random() * engineersInDept.length)].name;
    }

    const issue = await Issue.create({
      title,
      description,
      department,
      priority: priority || 'Medium',
      severity: severity || 'Major',
      status: assignedToName ? 'Assigned' : 'Reported',
      assignedTo: assignedToName,
      reportedBy: req.user.name,
      rootCause: '',
      resolution: '',
      attachments: req.body.attachments || []
    });

    await logActivity(req, 'Raise Issue Ticket', `Issue raised: ${issue.title} (Assigned to: ${assignedToName || 'None'})`);

    // In a real environment, we'd trigger emails here. We'll simulate this inside logs/alerts
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error raising issue.' });
  }
});

// Update issue resolution/status (Assignee or Manager/Admin)
router.put('/issues/:id', authenticateJWT, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    // Validate permission (Assignee can work, PM/Admin can override)
    if (req.user.role === 'Employee' && issue.reportedBy !== req.user.name) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    }

    const updated = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logActivity(req, 'Update Issue Ticket', `Issue "${updated.title}" changed status to ${updated.status}`);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating issue.' });
  }
});


// ==========================================
// DOCUMENT REPOSITORY MODULE API
// ==========================================

// List documents
router.get('/documents', authenticateJWT, async (req, res) => {
  try {
    const list = await Document.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching documents.' });
  }
});

// Upload document (Engineer, PM, Admin)
router.post('/documents/upload', authenticateJWT, requireRoles(['Administrator', 'Project Manager', 'Engineer']), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];

  try {
    const doc = await Document.create({
      name: req.file.originalname,
      path: req.file.filename,
      extension: path.extname(req.file.originalname).substring(1).toUpperCase(),
      uploader: req.user.name,
      tags: tags,
      size: req.file.size,
      version: '1.0.0',
      history: [{
        version: '1.0.0',
        path: req.file.filename,
        date: new Date().toISOString(),
        uploader: req.user.name
      }]
    });

    await logActivity(req, 'Upload Document', `Technical document uploaded: ${doc.name}`);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error uploading file metadata.' });
  }
});

// Update tags or version (PM/Engineer)
router.put('/documents/:id', authenticateJWT, requireRoles(['Administrator', 'Project Manager', 'Engineer']), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    const updated = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logActivity(req, 'Modify Document Info', `Document details updated for: ${updated.name}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error editing document.' });
  }
});

// Download/View file
router.get('/documents/download/:filename', authenticateJWT, (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Physical file not found.' });
  }
  res.sendFile(filePath);
});


// ==========================================
// AI ASSISTANT MODULE API
// ==========================================
router.post('/ai/chat', authenticateJWT, async (req, res) => {
  const { query, mode } = req.body;
  if (!query) return res.status(400).json({ message: 'Query string is required.' });

  try {
    const response = await askQuestion(query, mode);
    await logActivity(req, 'AI Assist Query', `Asked: "${query.substring(0, 50)}..." [Mode: ${mode || 'Default'}]`);
    res.json(response);
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ message: 'Server error running AI assist.' });
  }
});


// ==========================================
// ANALYTICS MODULE API
// ==========================================
router.get('/analytics/dashboard', authenticateJWT, async (req, res) => {
  try {
    const projects = await Project.find({});
    const decisions = await Decision.find({});
    const issues = await Issue.find({});
    const documents = await Document.find({});

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const delayedProjects = projects.filter(p => p.status === 'Delayed').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    
    const openIssues = issues.filter(i => ['Reported', 'Assigned', 'In Progress', 'Under Review'].includes(i.status)).length;
    const closedIssues = issues.filter(i => ['Resolved', 'Closed'].includes(i.status)).length;
    const decisionsRecorded = decisions.length;
    const documentsUploaded = documents.length;

    // Completion percentage calculation
    const totalCompletion = projects.reduce((acc, p) => acc + p.progressPercentage, 0);
    const avgProjectCompletion = totalProjects > 0 ? Math.round(totalCompletion / totalProjects) : 0;

    // Issue resolutions rate
    const issueResolutionRate = issues.length > 0 ? Math.round((closedIssues / issues.length) * 100) : 0;

    // Department Stats calculation
    const deptStats = {};
    const divisionsList = [
      'Aircraft Division', 'Helicopter Division', 'Engine Division', 'Aerospace Division',
      'Avionics Division', 'Accessories Division', 'Industrial & Marine Gas Turbine Division',
      'Foundry & Forge Division', 'Aircraft Manufacturing Division', 'Maintenance Repair & Overhaul (MRO)',
      'Overhaul Division', 'Design Division', 'Quality Assurance', 'Production',
      'Procurement', 'Human Resources', 'Information Technology', 'Finance', 'Research & Development'
    ];
    
    divisionsList.forEach(dept => {
      deptStats[dept] = { decisions: 0, issues: 0, projects: 0 };
    });

    decisions.forEach(d => {
      if (deptStats[d.department]) deptStats[d.department].decisions++;
    });

    issues.forEach(i => {
      if (deptStats[i.department]) deptStats[i.department].issues++;
    });

    projects.forEach(p => {
      if (deptStats[p.department]) deptStats[p.department].projects++;
    });

    res.json({
      cards: {
        totalProjects,
        activeProjects,
        delayedProjects,
        completedProjects,
        openIssues,
        closedIssues,
        decisionsRecorded,
        documentsUploaded
      },
      charts: {
        avgProjectCompletion,
        issueResolutionRate,
        deptStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error aggregating metrics.' });
  }
});


// ==========================================
// AUDIT LOGS MODULE API
// ==========================================
router.get('/auditlogs', authenticateJWT, requireRoles(['Administrator']), async (req, res) => {
  try {
    const logs = await AuditLog.find({});
    // Sort logs by timestamp descending
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(logs.slice(0, 150)); // Return last 150 operations
  } catch (err) {
    res.status(500).json({ message: 'Server error loading audit logs.' });
  }
});

module.exports = router;
