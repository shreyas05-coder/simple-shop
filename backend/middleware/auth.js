const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }
  const token = authHeader.substring(7)
  try {
    const payload = jwt.verify(token, process.env.SECRET || 'dev-secret-key-change-in-production')
    req.user = payload
    next()
  } catch (err) {
    return next()
  }
}

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { authMiddleware, requireAuth, requireAdmin }
