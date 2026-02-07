import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1770465339154 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create type transaction_type as enum('CREDIT', 'DEBIT');`,
    );

    await queryRunner.query(`
        create table transactions(
            id uuid primary key,
            user_id int4,
            amount float,
            type transaction_type,
            created_at timestamp default now()
        );
    `);

    await queryRunner.query(
      `create index transactions_user_id_created_at_idx on transactions(user_id, created_at desc)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index transactions_user_id_created_at_idx`);
    await queryRunner.query(`drop table transactions`);
    await queryRunner.query(`drop type transaction_type`);
  }
}
