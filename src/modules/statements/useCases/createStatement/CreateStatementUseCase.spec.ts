import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a deposit", async () => {
    const user = await createUserUseCase.execute({
      name: "test name",
      email: "email@test.com",
      password: "test password",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 100,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });

    expect(deposit).toHaveProperty("id");
    expect(deposit.amount).toBe(100);
    expect(deposit.description).toBe("test deposit");
  });

  it("should be able to create a withdraw", async () => {
    const user = await createUserUseCase.execute({
      name: "test name",
      email: "email@test.com",
      password: "test password",
    });

    await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 100,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 50,
      description: "test withdraw",
      type: OperationType.WITHDRAW,
    });

    expect(withdraw).toHaveProperty("id");
    expect(withdraw.amount).toBe(50);
    expect(withdraw.description).toBe("test withdraw");
  });

  it("should not be able to withdraw with insufficient funds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "test name",
        email: "email@test.com",
        password: "test password",
      });

      await createStatementUseCase.execute({
        user_id: user.id!,
        amount: 50,
        description: "test withdraw",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
