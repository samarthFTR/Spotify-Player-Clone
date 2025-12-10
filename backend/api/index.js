import serverless from "serverless-http";
import app from "../app.js";

// Vercel routes /api/* requests to this handler.
// We need to rewrite the path to remove /api prefix so Express routes match.
// For example: /api/songs -> /songs (which matches app.use("/songs", ...))
const handler = serverless(app, {
  request: (request) => {
    // Remove /api prefix from the path if it exists
    if (request.path.startsWith("/api/")) {
      request.path = request.path.slice(4); // Remove '/api'
    }
    return request;
  }
});

export default handler;
