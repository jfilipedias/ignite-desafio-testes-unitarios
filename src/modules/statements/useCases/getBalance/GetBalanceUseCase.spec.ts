import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

describe("Gets the balance", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it("should list all the statements and funds in the balance", async() => {
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

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id,
      type: "withdraw",
      amount: 20,
      description: "A 20 dollars withdraw"
    } as ICreateStatementDTO );

    const balance = await getBalanceUseCase.execute({user_id: user.id as string});

    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
    expect(balance.statement[0]).toEqual(deposit)
    expect(balance.statement[1]).toEqual(withdraw)
    expect(balance.balance).toEqual(0)
  });

  it("should not be able to list the statements and funds in the balance from a non-existing user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "123" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
