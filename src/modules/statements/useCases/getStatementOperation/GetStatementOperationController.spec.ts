import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../shared/infra/typeorm";

let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list statement operations by user and statement id", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "user@example.com",
        password: "password123"
      });

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password123"
      });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send({
        amount: 200,
        description: "Deposit U$200.00"
      });

    const responseDeposit = await request(app)
    .get("/api/v1/statements/balance")
    .set({ Authorization: `Bearer ${token}` })
    .send();

    const { id } = responseDeposit.body.statement[0];

    const response = await request(app)
    .get(`/api/v1/statements/${id}`)
    .set({ Authorization: `Bearer ${token}` })
    .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
    expect(response.body.id).toEqual(id);
    expect(response.body.amount).toEqual("200.00");
    expect(response.body.type).toEqual("deposit");
    expect(response.body.description).toEqual("Deposit U$200.00");
  });

  it("should not be able to list statement of a non-existing user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password123"
      });

    const { token } = responseToken.body;

    const responseDeposit = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` })
      .send();

    const { id } = responseDeposit.body.statement[0];

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({ Authorization: "Bearer 1234567890" })
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });

  it("should not be able to list statement of a non-existing statement id", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password123"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/0962443e-494c-4000-b0c0-ac2e6244853d")
      .set({ Authorization: `Bearer ${token}` })
      .send();

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("Statement not found");
  });
});
