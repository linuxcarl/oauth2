const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const request = require("request");
const { config } = require("./config");

const encodeBasic = require("./utils/encodeBasic");
const port = config.hostPort;
const secret = config.authJwtSecret;
const app = express();
//Habilitar CORS para los request especificos de un cliente (Recomendado para producción)
/*
const corsOptions = { origin: "http://example.com" };
app.use(cors(corsOptions))
*/
app.use(cors())

// body parser
app.use(bodyParser.json());

function getUserPlaylists(accessToken, userId) {
  if (!accessToken || !userId) {
    return Promise.resolve(null);
  }

  const options = {
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.get(options, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        reject(error);
      }

      resolve(body);
    });
  });
}

app.post("/api/auth/token", function (req, res) {
  const { email, username, name } = req.body;
  const token = jwt.sign({ sub: username, email, name }, secret);
  res.json({ access_token: token });
});

app.get("/api/auth/verify", function (req, res, next) {
  const { access_token } = req.query;

  try {
    const decoded = jwt.verify(access_token, secret);
    res.json({ message: "the access token is valid", username: decoded.sub });
  } catch (err) {
    next(err);
  }
});
app.get("/api/playlists", async function (req, res, next) {
  const { userId } = req.query;

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization: `Basic ${encodeBasic(
        config.spotifyClientId,
        config.spotifyClientSecret
      )}`,
    },
    form: {
      grant_type: "client_credentials",
    },
    json: true,
  };

  request.post(authOptions, async function (error, response, body) {
    if (error || response.statusCode !== 200) {
      next(error);
    }

    const accessToken = body.access_token;
    const userPlaylists = await getUserPlaylists(accessToken, userId);
    res.json({ playlists: userPlaylists });
  });
});

const server = app.listen(port, () => {
  console.log(`Listening http://localhost:${port}`);
});
