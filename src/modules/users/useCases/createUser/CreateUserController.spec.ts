import request from "supertest";
import { Connection } from "typeorm/connection/Connection";

import { app } from "../../../../app";
import createConnection from "../../../../shared/infra/typeorm"

let connection: Connection;

describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async() => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "user@example.com",
        password: "password123"
      });

      expect(response.status).toBe(201);
  });

  it("should not be able to create a user with the same email", async() => {
    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "User Name",
      email: "user@example.com",
      password: "password123"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("User already exists");
  })
});
