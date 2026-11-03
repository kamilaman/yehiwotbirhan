/**
 * cPanel Phusion Passenger / Standalone Entrypoint
 * BATU YEHIYWOT BERHAN CHURCH — Backend API
 */

const app = require('./src/server');
const config = require('./src/config');

// In Phusion Passenger environments, the port or socket is injected automatically
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const port = process.env.PORT || config.port || 5000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`[cPanel Passenger / Node] Server listening on port ${port}`);
  });
}

module.exports = app;
