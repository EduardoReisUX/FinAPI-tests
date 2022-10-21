import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should show user data if user is authenticated", async () => {
    await createUserUseCase.execute({
      name: "test name",
      email: "email@test.com",
      password: "test password",
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "email@test.com",
      password: "test password",
    });

    const userProfile = await showUserProfileUseCase.execute(user.id!);

    expect(userProfile.email).toBe("email@test.com");
    expect(userProfile.name).toBe("test name");
    expect(userProfile).toHaveProperty("id");
    expect(userProfile).toHaveProperty("password");
  });

  it("should not show user data if user is not authenticated", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("random incorrect id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
