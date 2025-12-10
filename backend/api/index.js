import serverless from "serverless-http";
import app from "../app.js";

// Export a serverless handler that Vercel (or other serverless platforms) can invoke.
// Vercel will map incoming requests to this function. The app has routes under /api/*
export const handler = serverless(app);
export default handler;
