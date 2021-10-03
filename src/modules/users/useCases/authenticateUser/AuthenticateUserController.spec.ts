import request from "supertest";
import { Connection } from "typeorm/connection/Connection";

import { app } from "../../../../app";
import createConnection from "../../../../shared/infra/typeorm";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "user@example.com",
        password: "password123"
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "foo@example.com",
        password: "password123"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });

  it("should not be able to authenticate an user with wrong password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password12"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });
});
