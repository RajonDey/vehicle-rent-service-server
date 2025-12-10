// Vercel serverless function handler
// Import the compiled Express app from dist
const app = require("../dist/server").default;

module.exports = app;
