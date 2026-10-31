// Builds the Express app (middleware, routes, error handling) without starting
// it, so server.js can start it and tests could import it without a port.
const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: config.clientOrigin === '*' ? '*' : config.clientOrigin.split(',').map((o) => o.trim()),
  }),
);
app.use(express.json({ limit: '100kb' }));

// Friendly answer for someone opening the API's base URL in a browser.
app.get('/', (req, res) => res.json({ name: 'NoteNest API', health: '/api/health' }));

app.use('/api', routes);

// Must be last: "no route matched", then "format any error".
app.use(notFound);
app.use(errorHandler);

module.exports = app;
