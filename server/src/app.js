import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import morgan from "morgan";

import api from "./routes/api.js";

const fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(fileName);

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("combined"));
app.get("/index.html", (req, res) => {
  return res.redirect("/");
});
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/v1", api);
app.get("/*", (req, res) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname + "/../public/index.html"));
  console.log("serving");
});

export default app;
