// middleware.js

// This middleware function logs the request method and URL for each incoming request
function logRequest(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

// This middleware function sets the 'X-Powered-By' header to 'Express'
function setPoweredByHeader(req, res, next) {
  res.setHeader("X-Powered-By", "Express");
  next();
}

// This middleware function handles errors by logging them and sending an error response to the client
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
}

export { logRequest, setPoweredByHeader, errorHandler };
