const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./services/db');
const apiRouter = require('./routes/api');
const { Issue, AuditLog, User } = require('./models');
const { seed } = require('./seed');

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and parsing body
app.use(cors({
  origin: ['https://hal-kdms.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: "HAL's BRAIN Backend"
  });
});

// Start Express server and connect Database
async function bootstrap() {
  await connectDB();
  
  // Check if User collection is empty on startup, and seed if needed
  try {
    const existingUsers = await User.find({});
    if (existingUsers.length === 0) {
      console.log('No users found in database. Running automatic seeding...');
      await seed(false);
    } else {
      console.log(`Database already has ${existingUsers.length} user(s). Skipping automatic seeding.`);
    }
  } catch (err) {
    console.error('Error during automatic database seeding check:', err);
  }
  
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`HAL's BRAIN Backend Server is actively running on Port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'Development'}`);
    console.log(`=======================================================`);
  });

  // Start background cron-like checking for SLA tickets escalation
  startSlaEscalationChecker();
}

// SLA issue checker background service
function startSlaEscalationChecker() {
  console.log('Background SLA Escalation Monitor initiated (running hourly scans).');
  
  // Run scan every 1 minute to keep it fast for visual demo updates, using real dates
  setInterval(async () => {
    try {
      const issues = await Issue.find({
        status: { $ne: 'Closed' } // Exclude closed issues
      });
      
      const now = new Date();
      for (let issue of issues) {
        // Double check status is not Resolved as well
        if (issue.status === 'Resolved') continue;

        const createdTime = new Date(issue.createdAt || issue.updatedAt);
        const diffMs = now - createdTime;
        const diffHours = diffMs / (1000 * 60 * 60);

        // For simulation purposes: if the issue has a priority of Critical/High, 
        // we can accelerate the SLA hours or check standard thresholds
        let alertTier = 'Normal';
        let notifyTarget = '';

        if (diffHours >= 72) {
          alertTier = 'Senior Management Escalation';
          notifyTarget = 'Senior VP Operations & Board';
        } else if (diffHours >= 48) {
          alertTier = 'Project Manager Alert';
          notifyTarget = 'General Manager / Project Director';
        } else if (diffHours >= 24) {
          alertTier = 'Department Head Escalation';
          notifyTarget = 'Chief Aerodynamicist / Department Head';
        }

        // If an escalation threshold is breached, and we haven't logged it recently,
        // log an audit trail and system notification simulation
        if (notifyTarget && !issue.slaAlertsSent) {
          console.warn(`[SLA ESCALATION] Ticket ID ${issue.id || issue._id} ("${issue.title}") has been open for ${Math.round(diffHours)} hours. Notifying: ${notifyTarget}`);
          
          await AuditLog.create({
            userId: 'System-SLA',
            userName: 'SLA Escalation Service',
            action: 'SLA Breach Escalation',
            details: `Issue ticket "${issue.title}" breached SLA milestone. Escalated to: ${notifyTarget}. Hours active: ${Math.round(diffHours)}`,
            ipAddress: '127.0.0.1'
          });

          // Mark flag so we do not spam alerts repeatedly
          await Issue.findByIdAndUpdate(issue.id || issue._id, { slaAlertsSent: true });
        }
      }
    } catch (err) {
      console.error('Error during background SLA escalation check:', err.message);
    }
  }, 60000); // scan every 60 seconds
}

bootstrap();
