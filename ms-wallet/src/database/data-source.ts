import { DataSource } from 'typeorm';

require('dotenv').config();

export default new DataSource({
  synchronize: false,
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
});
