export class UserWithBalanceException extends Error {
  constructor(
    public user_id: string,
    public balance: number,
  ) {
    super();
  }
}
