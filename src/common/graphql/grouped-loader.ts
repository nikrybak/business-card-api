import DataLoader from 'dataloader';

/**
 * Batches "children of a parent" lookups: every parent id requested during one tick
 * is resolved by a single query, and each parent gets its own group back in order
 */
export function groupedLoader<T>(
  fetch: (parentIds: readonly number[]) => Promise<T[]>,
  parentIdOf: (row: T) => number,
): DataLoader<number, T[]> {
  return new DataLoader(async (parentIds) => {
    const groups = Map.groupBy(await fetch(parentIds), parentIdOf);
    return parentIds.map((id) => groups.get(id) ?? []);
  });
}
