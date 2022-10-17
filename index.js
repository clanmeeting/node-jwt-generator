require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Api-Key');
  next();
});

app.use((req, res, next) => {
  const apiKey = req.get('X-Api-Key')
  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  } else {
    next();
  }
})

app.get("/api/v1/generate-token", (req, res) => {
  const { consumerId, roomName } = req.query;
  if (consumerId && roomName) {
    const header = {
      keyid: consumerId,
      algorithm: "RS256"
    }
    const payLoad = {
      sub: consumerId,
      aud: "clanmeeting",
      iss: "production",
      room: roomName,
      // valid for 5 minutes
      exp: Math.floor(Date.now() / 1000) + (60 * 5),
      nbf: Math.floor(Date.now() / 1000),
      context: {},
    }
    const signature = fs.readFileSync('cm-api-key.pem');
    const token = jwt.sign(payLoad, signature, header);
    if (token) return res.status(200).json({ success: true, data: { token: token } });
    return res.status(500).json({ success: false, error: { message: 'Error generating token' } });
  }
  return res.status(400).json({ success: false, error: { message: 'consumerId and roomName are mandatory parameters' } });
});

let port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is up and running on ${port} ...`);
});