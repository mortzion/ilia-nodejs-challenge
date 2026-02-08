import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1770473818255 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            create table users(
                id uuid primary key,
                first_name varchar(255),
                last_name varchar(255),
                password varchar(255),
                email varchar(255),
                deleted_at timestamp null
            );
        `);

    await queryRunner.query(
      `create unique index users_email_idx on users(email);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index users_email_idx;`);
    await queryRunner.query(`drop table users;`);
  }
}
