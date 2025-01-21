import http from "http";
import "dotenv/config";

import app from "./app.js";
import { loadData } from "./models/planets.model.js";
import { mongoConnect } from "./services/mongo.js";
import { loadLaunchData } from "./models/launches.model.js";

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
async function startServer() {
  await mongoConnect();

  await loadData();

  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`The Server is running on port ${PORT}`);
  });
}
startServer();
