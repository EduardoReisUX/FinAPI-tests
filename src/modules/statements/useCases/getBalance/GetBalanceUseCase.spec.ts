import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });
  Statement;

  it("should return list of all withdrawals, deposists and total balance of an user", async () => {
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

    await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 50,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });

    const { balance, statement } = await getBalanceUseCase.execute({
      user_id: user.id!,
    });

    expect(balance).toBe(150);
    expect(statement).toHaveLength(2);
    expect(statement[0].amount).toBe(100);
    expect(statement[1].amount).toBe(50);
  });

  it("should return error if user doesn't exists", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "random incorrect id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
