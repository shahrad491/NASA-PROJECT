import request from "supertest";

import app from "../../app.js";
import { mongoConnect, mongoDisconnect } from "../../services/mongo.js";

describe("Starts the Tests", () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  describe("testing GET /launches", () => {
    test("it should responed with 200 ", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("testing POST /launches", () => {
    const testingPostBody = {
      mission: "test",
      rocket: "test rocket",
      target: "Kepler-1652 b",
      launchDate: "January 18, 2030",
    };
    test("it should respond with 201 Created status code", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testingPostBody)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(testingPostBody.launchDate).toISOString();

      expect(response.body).toMatchObject({
        mission: "test",
        rocket: "test rocket",
        target: testingPostBody.target,
        launchDate: requestDate,
      });
    });
    test("it should catch missing property", async () => {
      const misingPost = Object.assign({}, testingPostBody);
      delete misingPost.mission;
      const response = await request(app)
        .post("/v1/launches")
        .send(misingPost)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        err: "you didnt fill the requirement correctly",
      });
    });
    test("it catch invalid date ", async () => {
      const invalidDatePost = Object.assign({}, testingPostBody);
      invalidDatePost.launchDate = "alalal";
      const response = await request(app)
        .post("/v1/launches")
        .send(invalidDatePost)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        err: "Invalid Date",
      });
    });
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
});
