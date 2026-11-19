import DataLoader from 'dataloader';

export function groupedLoader<T>(
  load: (parentIds: readonly number[]) => Promise<T[]>,
  parentIdOf: (row: T) => number,
): DataLoader<number, T[]> {
  return new DataLoader(async (parentIds) => {
    const groups = Map.groupBy(await load(parentIds), parentIdOf);
    return parentIds.map((id) => groups.get(id) ?? []);
  });
}
