import { Inject, Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { GetBalanceDto } from '../dtos/get-balance.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { getBalanceCacheKey } from '../utils/cache-key';

/**
 * I am using a cache to avoid recomputing the balance of the user.
 * A separate table could be used to store the balance using a trigger after inserting
 * a transaction and a lock to avoid multiple request updating the same balance concurrently.
 * Due to the description used in the OpenAPI endpoint specification that solution was not used
 */
@Injectable()
export class GetBalanceAction {
  private static BALANCE_CACHE_TTL =
    1000 * Number(process.env.BALANCE_CACHE_TTL_SECONDS ?? 3600);

  constructor(
    private repository: TransactionsRepository,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async execute(dto: GetBalanceDto): Promise<number> {
    const cacheKey = getBalanceCacheKey(dto.user_id);

    try {
      const balance = await this.cache.wrap<number>(
        cacheKey,
        () => this.repository.balance(dto.user_id),
        GetBalanceAction.BALANCE_CACHE_TTL * 1000,
      );

      return balance;
    } catch {
      // I haven't implemented a logging system, but here the error should be logged.
      // We are recomputing the balance since the cache could not be available right now.
      return await this.repository.balance(dto.user_id);
    }
  }
}
