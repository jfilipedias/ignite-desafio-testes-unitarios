import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile", () => {
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let userRepository: InMemoryUsersRepository;

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepository);
  });

  it("should be able to show a user profile", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "Filipe",
      email: "filipe@email.com",
      password: "password"
    });

    const { user, ...rest } = await authenticateUserUseCase.execute({
      email: "filipe@email.com",
      password: "password"
    });

    const profile = await showUserProfileUseCase.execute(user.id as string);

    expect(createdUser).toEqual(profile);
  });

  it("should not be able to show a non-existing user profile", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("123456");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
});
