import { getAllPlanets } from "../../models/planets.model.js";
export async function httpGetAllPlanets(req, res) {
  console.log(await getAllPlanets());
  return res.status(200).json(await getAllPlanets());
}
