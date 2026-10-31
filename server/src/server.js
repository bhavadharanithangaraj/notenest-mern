// Entry point: connect to MongoDB first, then start listening for requests.
// If the database can't be reached, exit with an error instead of running half-broken.
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`NoteNest API listening on http://localhost:${config.port} (${config.nodeEnv})`);
    });
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
