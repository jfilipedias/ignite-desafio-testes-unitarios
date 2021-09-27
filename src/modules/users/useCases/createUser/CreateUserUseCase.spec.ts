import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Create user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual("Filipe");
    expect(user.email).toEqual("filipe@email.com");
  });

  it("should not be able to create a user with an already existing email", () => {
  expect(async () => {
    await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    await createUserUseCase.execute({
      name: "Lucas",
      email: "filipe@email.com",
      password: "password2"
    });
  }).rejects.toBeInstanceOf(CreateUserError);
  })
});
