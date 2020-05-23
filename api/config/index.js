require('dotenv').config()

const config = {
  authJwtSecret: process.env.AUTH_JWT_SECRET,
  hostPort: process.env.HOST_PORT
}

module.exports = {
  config: config
}
