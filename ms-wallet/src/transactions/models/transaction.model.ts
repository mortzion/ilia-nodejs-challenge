import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export enum TransactionType {
  credit = 'CREDIT',
  debit = 'DEBIT',
}

@Entity('transactions')
export class Transaction {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'enum', enumName: 'transaction_type' })
  type: TransactionType;

  @CreateDateColumn()
  created_at: Date;
}
