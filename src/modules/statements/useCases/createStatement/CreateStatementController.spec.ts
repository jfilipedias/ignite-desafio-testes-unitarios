import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../shared/infra/typeorm";

let connection: Connection;

describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
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

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send({
        amount: 200,
        description: "Deposit U$200.00"
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toEqual(200);
    expect(response.body.description).toEqual("Deposit U$200.00");
    expect(response.body.type).toEqual("deposit");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should be able to create a withdraw statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password123"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({
        amount: 100,
        description: "Withdraw U$100.00"
      });

      expect(response.status).toBe(201);
      expect(response.body.amount).toEqual(100);
      expect(response.body.description).toEqual("Withdraw U$100.00");
      expect(response.body.type).toEqual("withdraw");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("user_id");
      expect(response.body).toHaveProperty("amount");
      expect(response.body).toHaveProperty("type");
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to create a withdraw statement with an insufficient funds", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@example.com",
        password: "password123"
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({
        amount: 300,
        description: "Withdraw U$300.00"
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual("Insufficient funds");
  });

  it("should not be able to create a withdraw statement to a non-existing user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer 1234567890` })
      .send({
        amount: 300,
        description: "Withdraw U$300.00"
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual("JWT invalid token!");
  });

  it("should not be able to create a deposit statement to a non-existing user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer 1234567890` })
      .send({
        amount: 300,
        description: "Deposit U$300.00"
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual("JWT invalid token!");
  });
});
