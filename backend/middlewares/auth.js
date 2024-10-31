// middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: '未提供令牌' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: '無效的令牌' });
    req.userId = decoded.userId;
    next();
  });
};
