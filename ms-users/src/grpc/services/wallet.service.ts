import { Observable } from 'rxjs';

interface BalanceData {
  user_id: string;
}

interface BalanecResponse {
  amount: number;
}

export interface WalletService {
  balance(data: BalanceData): Observable<BalanecResponse>;
}
