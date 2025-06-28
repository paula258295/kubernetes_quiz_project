const jwt = require('jsonwebtoken');


function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        expiredAt: err.expiredAt,
      });
    }
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}

module.exports = auth;