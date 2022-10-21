import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able return a statement operation", async () => {
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

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: deposit.id!,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toHaveProperty("user_id");
    expect(statementOperation.type).toBe("deposit");
    expect(statementOperation.amount).toBe(100);
    expect(statementOperation.description).toBe("test deposit");
  });

  it("should not be able return a statement operation if user doesn't exists", async () => {
    expect(async () => {
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

      await getStatementOperationUseCase.execute({
        user_id: "random incorrect id",
        statement_id: deposit.id!,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able return a statement operation if statement doesn't exists", async () => {
    expect(async () => {
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

      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "random incorrect id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
