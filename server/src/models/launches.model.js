import axios from "axios";

import launchesData from "./launches.mongo.js";
import planetsMongo from "./planets.mongo.js";
import { spaceX_API_URL } from "../config.js";

const DEFAULT_FLIGHTNUM = 100;

// const launches = new Map();

//* THIS WAS a TEST for launch
// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "Kepler Exploration X", //name
//   rocket: "Explorer IS1", //rocket.name
//   launchDate: new Date("December 27,2030"), //date_local
//   target: "Kepler-442 b", // not applicable
//   customer: ["ZTM", "NASA"], //payload.customers
//   upcoming: true, // upcoming
//   success: true, // success
// };

// saveLaunch(launch);

// launches.set(launch.flightNumber, launch);

export async function getSpaceXData() {
  console.log("downloading space x api data");
  const response = await axios.post(spaceX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.error("failed to fetch spaceX data");
    throw new Error("Couldnt get the api Data");
  }

  const launchDocs = response.data.docs;
  // console.log(launchDocs);
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customers: customers,
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
    };
    console.log(launch.flightNumber, launch.mission);

    await saveLaunch(launch);
  }
}

export async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("api already exists");
    return;
  } else {
    await getSpaceXData();
  }
}

export async function findLaunch(filter) {
  return await launchesData.findOne(filter);
}

export async function launchExists(id) {
  return await findLaunch({ flightNumber: id });
}

export async function getLatestFlightNum() {
  const FlightNum = await launchesData.findOne().sort("-flightNumber");
  if (!FlightNum) {
    return DEFAULT_FLIGHTNUM;
  } else {
    return FlightNum.flightNumber;
  }
}

export async function getAllLaunches(skip, limit) {
  return await launchesData
    .find({}, { _id: 0, __v: 0 })
    .sort("flightNumber")
    .skip(skip)
    .limit(limit);
}

export async function saveLaunch(launch) {
  return await launchesData.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function chechPlanet(launch) {
  const planet = await planetsMongo.findOne({ keplerName: launch.target });

  if (!planet) {
    console.log(planet);
    throw new Error("Planet Was NOT FOUND");
  }
}

export async function addLaunchDB(launch) {
  await chechPlanet(launch);
  const newFlightNumber = (await getLatestFlightNum()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
  return newLaunch;
}

// export function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customer: ["ZTM", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

export async function deleteLaunch(id) {
  return await launchesData.findOneAndUpdate(
    { flightNumber: id },
    { upcoming: false, success: false }
  );

  // const aborted = launchesData.get(id);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}
