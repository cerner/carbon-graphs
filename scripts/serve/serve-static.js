const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const displayServer = (localAddress) => {
  console.log('[serve-static] Server started listening at');
  console.log(`* Local:            ${localAddress}`);
};

const dirExistsWithContent = site => fs.existsSync(site) && fs.lstatSync(site).isDirectory() && fs.readdirSync(site).length > 0;

// Setup a static express server
const staticApp = (site, index) => {
  const app = express();
  const options = {
    ...index && { index },
    // If an extension-less file can't be found search for it with .html and .htm
    extensions: ['html', 'htm'],
  };
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
  // Return any files in the site. If no extension is provided check the file with the htm or html extension.
  app.use(express.static(site, options));
  // Match on *.htm, *.html or routes without extensions.
  app.use([/\/[^.]*$/, '/*.html?'], (req, res, next) => {
    // Return 404.html if provided.
    res.status(404).sendFile('/404.html', { root: site }, () => {
      // If there is an error, bail.
      next();
    });
  });

  return app;
};

// Generate a site if not provided and spin up an express server to serve the site.
const serve = (options) => {
  const {
    // Setting defaults here instead of in cli.
    site = './build', port = 8080, host = '0.0.0.0', index,
  } = options;

  if (!dirExistsWithContent(site)) {
    return console.warn(`Cannot serves content from ${site} because it does not exist or it is empty.`, { context });
  }

  const app = staticApp(site, index);

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, (err) => {
      if (err) {
        reject(err);
      }
      const localAddress = `http://${host}:${port}/`;
      displayServer(localAddress);
      resolve(server);
    });
  });
};

module.exports = serve;
