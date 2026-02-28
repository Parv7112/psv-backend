import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./db/connectMongo.js";

const app = createApp();
const server = http.createServer(app);

await connectMongo(env.MONGODB_URI);

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${env.PORT}`);
});

