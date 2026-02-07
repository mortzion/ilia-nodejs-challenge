export class EmailAlreadyInUseException extends Error {
  email: string;

  constructor(email: string, message?: string) {
    super(message);

    this.email = email;
  }
}
