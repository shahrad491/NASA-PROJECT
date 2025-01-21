import { parse } from "csv-parse";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";

import planets from "./planets.mongo.js";
const fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(fileName);

function IsLiveable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

export function loadData() {
  console.log(
    "running",
    path.join(__dirname + "../../../data/kepler-data.csv")
  );
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname + "../../../data/kepler-data.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (IsLiveable(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => reject(err))
      .on("end", async () => {
        const planetsArray = (await getAllPlanets()).length;
        console.log(`${planetsArray} planets Found`);
        resolve();
      });
  });
}
export async function getAllPlanets() {
  return await planets.find(
    {},
    {
      keplerName: 1,
      _id: 0,
    }
  );
}
async function savePlanet(data) {
  try {
    await planets.updateOne(
      {
        keplerName: data.kepler_name,
      },
      { keplerName: data.kepler_name },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could Not Save planet ${err}`);
  }
}
