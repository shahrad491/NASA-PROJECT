import express from "express";
import {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpDeleteLaunch,
} from "./launches.controller.js";

const launchesRouter = express.Router();

launchesRouter.route("/").get(httpGetAllLaunches).post(httpAddNewLaunch);

launchesRouter.route("/:id").delete(httpDeleteLaunch);
export default launchesRouter;
