const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hkdms_secure_secret_key_12345';

function authenticateJWT(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token || req.query.auth_token) {
    token = req.query.token || req.query.auth_token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token is invalid or expired.' });
  }
}

function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User is not authenticated.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.` 
      });
    }
    
    next();
  };
}

module.exports = {
  authenticateJWT,
  requireRoles,
  JWT_SECRET
};
