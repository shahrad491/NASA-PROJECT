import mongoose from "mongoose";

import { mongoURL } from "../config.js";
const db = mongoose.connection;
db.on("error", (err) => {
  console.error(err);
});
db.on("open", () => {
  console.log("MongoDB Connection is Ready");
});
db.on("disconnected", () => {
  console.log("MongoDB Connection is Disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close().then(() => {
    console.log("MongoDB Connection is Closed due to Application Termination");
  });
});

export async function mongoConnect() {
  await mongoose.connect(mongoURL);
}

export async function mongoDisconnect() {
  await mongoose.disconnect(mongoURL);
}
