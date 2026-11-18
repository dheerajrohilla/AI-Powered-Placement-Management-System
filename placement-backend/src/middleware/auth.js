import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists in database and account is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact platform administration.' });
    }

    // Attach verified user with id and role
    req.user = {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized or token expired.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route` });
    }
    next();
  };
};
