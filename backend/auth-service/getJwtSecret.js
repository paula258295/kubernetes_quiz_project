const fs = require('fs');

let jwtSecret = process.env.JWT_SECRET;
try {
  const secretFromFile = fs.readFileSync('/run/secrets/jwt_secret', 'utf8').trim();
  if (secretFromFile) jwtSecret = secretFromFile;
} catch (e) {
}

module.exports = jwtSecret;