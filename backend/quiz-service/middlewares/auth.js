const fetch = require('node-fetch');
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://auth-service:5003';

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!data.valid) {
      return res.status(401).json({ message: data.message || 'Invalid token' });
    }
    req.user = data.user;
    next();
  } catch (err) {
    next(err);
  }
};
