const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({message: 'Invalid token'});
    }
    req.user = user;
    next();
  });
};

module.exports = verifyToken;
