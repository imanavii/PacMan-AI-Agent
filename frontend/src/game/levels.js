// The maze used by the in-browser mock engine. '#' is a wall, '.' is open floor.
// Positions are [row, col] from the top-left corner.

export const DEFAULT_LEVEL = {
  grid: [
    '#####################',
    '#.........#.........#',
    '#.###.###.#.###.###.#',
    '#...................#',
    '#.###.#.#####.#.###.#',
    '#.....#...#...#.....#',
    '#####.###.#.###.#####',
    '#...................#',
    '#.###.#.#####.#.###.#',
    '#...#.#.......#.#...#',
    '###.#.#.#####.#.#.###',
    '#.........#.........#',
    '#.###.###.#.###.###.#',
    '#...................#',
    '#####################',
  ],
  pacStart: [9, 10],
  ghosts: [
    { id: 'red', start: [1, 9], behavior: 'chase' },
    { id: 'pink', start: [1, 11], behavior: 'ambush' },
    { id: 'cyan', start: [11, 3], behavior: 'random' },
    { id: 'orange', start: [11, 17], behavior: 'random' },
  ],
  coins: [
    [1, 1],
    [1, 19],
    [13, 1],
    [13, 19],
    [3, 10],
    [7, 10],
  ],
};
