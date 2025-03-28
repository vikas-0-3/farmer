const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g. { _id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
