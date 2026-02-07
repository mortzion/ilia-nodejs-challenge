import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export enum TransactionType {
  credit = 'CREDIT',
  debit = 'DEBIT',
}

@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'int4' })
  user_id: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'enum', enumName: 'transaction_type' })
  type: TransactionType;

  @CreateDateColumn()
  created_at: Date;
}
