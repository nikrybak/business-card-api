import { groupedLoader } from './grouped-loader';

describe('groupedLoader', () => {
  const rows = [
    { parentId: 2, value: 'b1' },
    { parentId: 1, value: 'a1' },
    { parentId: 2, value: 'b2' },
  ];

  it('resolves all keys of one tick with a single fetch, grouped in key order', async () => {
    const fetch = jest.fn(async () => rows);
    const loader = groupedLoader(fetch, (row) => row.parentId);

    const [first, second, missing] = await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith([1, 2, 3]);
    expect(first.map((row) => row.value)).toEqual(['a1']);
    expect(second.map((row) => row.value)).toEqual(['b1', 'b2']);
    expect(missing).toEqual([]);
  });
});
