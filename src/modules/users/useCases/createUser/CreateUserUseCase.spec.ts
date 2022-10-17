import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const createUserData = {
      email: "test@fin.com.br",
      name: "test",
      password: "123456",
    };

    const user = await createUserUseCase.execute(createUserData);

    expect(user.email).toEqual(createUserData.email);
    expect(user.name).toEqual(createUserData.name);
    expect(user.password).not.toEqual(createUserData.password);
    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a user that already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "test@fin.com.br",
        name: "test",
        password: "123456",
      });

      await createUserUseCase.execute({
        email: "test@fin.com.br",
        name: "test",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
