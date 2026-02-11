export function getBalanceCacheKey(user_id: string): string {
  return `BALANCE-${user_id}`;
}
