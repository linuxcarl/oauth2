const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { config } = require("./config");

const port = config.hostPort;
const secret = config.authJwtSecret;

const app = express();
//Habilitar CORS para los request especificos de un cliente (Recomendado para producción)
/*
const corsOptions = { origin: "http://example.com" };
app.use(cors(corsOptions))
*/
app.use(cors())

// body parse
app.use(bodyParser.json());

app.post("/api/auth/token", (req, res) => {
  const { email, username, name } = req.body;
  const token = jwt.sign({ sub: username, email, name }, secret);
  res.json({ access_token: token });
});

app.get("/api/auth/verify", async (req, res, next) => {
  const { access_token } = req.query;
  try {
    const decoded = jwt.verify(access_token, config.authJwtSecret);
    res.json({ message: "the access token is valid", username: decoded.sub });
  } catch (e) {
    next(e);
  }
});

const server = app.listen(port, () => {
  console.log(`Listening http://localhost:${port}`);
});
