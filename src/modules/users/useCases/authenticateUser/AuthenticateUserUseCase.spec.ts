import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let userRepository: InMemoryUsersRepository;

describe("Authenticate user", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    const { user, token } = await authenticateUserUseCase.execute({
      email: "filipe@email.com",
      password: "password"
    });

    expect(user.name).toEqual("Filipe");
    expect(user.email).toEqual("filipe@email.com");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should not be able to authenticate a non-existing user", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Filipe",
        email: "filipe@email.com",
        password: "password"
      });

      await authenticateUserUseCase.execute({
        email: "lucas@email.com",
        password: "password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an user  with wrong password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Filipe",
        email: "filipe@email.com",
        password: "password"
      });

      await authenticateUserUseCase.execute({
        email: "filipe@email.com",
        password: "password2"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
