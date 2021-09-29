import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

describe("Gets statement operations", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
  });

  it("should be able to list statement operations by user and statement id", async() => {
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

    const statements = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: deposit.id as string
    });

    expect(statements).toHaveProperty("id");
    expect(statements.user_id).toEqual(user.id);
    expect(statements.amount).toEqual(20);
    expect(statements.type).toEqual("deposit");
    expect(statements.description).toEqual("A 20 dollars deposit");
  });

  it("should not be able to list statement of a non-existing user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: "456"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to list statement of a non-existing statement id", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Filipe",
        email: "filipe@email.com",
        password: "password"
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "456"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
