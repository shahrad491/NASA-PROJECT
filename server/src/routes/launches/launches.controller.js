import {
  getAllLaunches,
  // addNewLaunch,
  addLaunchDB,
  deleteLaunch,
  launchExists,
} from "../../models/launches.model.js";
import { getPagination } from "../../services/query.js";
export async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  console.log(getPagination(req.query));
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

export async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.rocket ||
    !launch.target
  ) {
    return res
      .status(400)
      .json({ err: "you didnt fill the requirement correctly" });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ err: "Invalid Date" });
  }
  const dbres = await addLaunchDB(launch);
  return res.status(201).json(dbres);
}

export async function httpDeleteLaunch(req, res) {
  const id = Number(req.params.id);
  console.log(id);
  const launchExist = await launchExists(id);
  if (!launchExist) {
    return res.status(404).json({ err: "launch was not found" });
  }

  const aborted = await deleteLaunch(id);
  return res.status(200).json(aborted);
}
