import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../shared/infra/typeorm";

let connection: Connection;

describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list the statements and funds in the balance", async () => {
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

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({
        amount: 100,
        description: "Withdraw U$100.00"
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` })
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
    expect(response.body.statement.length).toBe(2);
    expect(response.body.statement[0].amount).toEqual(200);
    expect(response.body.statement[0].description).toEqual("Deposit U$200.00");
    expect(response.body.statement[0].type).toEqual("deposit");
    expect(response.body.statement[0]).toHaveProperty("id");
    expect(response.body.statement[0]).toHaveProperty("amount");
    expect(response.body.statement[0]).toHaveProperty("description");
    expect(response.body.statement[0]).toHaveProperty("type");
    expect(response.body.statement[0]).toHaveProperty("created_at");
    expect(response.body.statement[0]).toHaveProperty("updated_at");
    expect(response.body.statement[1].amount).toEqual(100);
    expect(response.body.statement[1].description).toEqual("Withdraw U$100.00");
    expect(response.body.statement[1].type).toEqual("withdraw");
    expect(response.body.statement[1]).toHaveProperty("id");
    expect(response.body.statement[1]).toHaveProperty("amount");
    expect(response.body.statement[1]).toHaveProperty("description");
    expect(response.body.statement[1]).toHaveProperty("type");
    expect(response.body.statement[1]).toHaveProperty("created_at");
    expect(response.body.statement[1]).toHaveProperty("updated_at");
  });

  it("should not be able to list the statements and funds in the balance from a non-existing user", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer1234567890` })
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });
});
