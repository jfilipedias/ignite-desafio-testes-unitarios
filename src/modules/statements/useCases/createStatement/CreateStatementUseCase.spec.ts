import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

describe("Creates a statement", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  it("should be able to create a deposit statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit",
      amount: 20,
      description: "A 20 dollars deposit"
    } as ICreateStatementDTO );

    expect(deposit).toHaveProperty("id");
    expect(deposit.user_id).toEqual(user.id);
    expect(deposit.amount).toEqual(20);
    expect(deposit.type).toEqual("deposit");
    expect(deposit.description).toEqual("A 20 dollars deposit");
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit",
      amount: 20,
      description: "A 20 dollars deposit"
    } as ICreateStatementDTO );

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id,
      type: "withdraw",
      amount: 20,
      description: "A 20 dollars withdraw"
    } as ICreateStatementDTO );

    expect(withdraw).toHaveProperty("id");
    expect(withdraw.user_id).toEqual(user.id);
    expect(withdraw.amount).toEqual(20);
    expect(withdraw.description).toEqual("A 20 dollars withdraw");
  });

  it("should not be able to create a withdraw statement with an insufficient funds", async () => {
    const user = await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        type: "withdraw",
        amount: 20,
        description: "A 20 dollars withdraw"
      } as ICreateStatementDTO );
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement to a non-existing user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "1234567890",
        type: "withdraw",
        amount: 20,
        description: "A 20 dollars withdraw"
      } as ICreateStatementDTO );
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
