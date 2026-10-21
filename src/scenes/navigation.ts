export type Cell = [number, number];
export type Goal = "plant" | "desk" | "door";
export const ROOM_GOALS: Record<Goal, Cell> = {
  plant: [6, 1],
  desk: [3, 2],
  door: [7, 0],
};
// Preserve the original 9x7 occupancy and four-connected shortest-path demo.
export const OBSTACLES = new Set([
  "2,0",
  "3,0",
  "4,0",
  "2,1",
  "3,1",
  "4,1",
  "0,1",
  "0,2",
  "0,3",
  "0,4",
  "3,3",
  "5,3",
  "5,4",
  "7,1",
]);
const key = ([x, y]: Cell) => `${x},${y}`;
export function shortestRoomRoute(start: Cell, goal: Cell): Cell[] {
  if (OBSTACLES.has(key(goal))) return [];
  const queue: Cell[] = [start],
    parents = new Map<string, Cell | null>([[key(start), null]]);
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (key(current) === key(goal)) {
      const route: Cell[] = [];
      let next: Cell | null = current;
      while (next) {
        route.unshift(next);
        next = parents.get(key(next)) ?? null;
      }
      return route;
    }
    for (const [dx, dy] of [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ]) {
      const cell: Cell = [current[0] + dx, current[1] + dy];
      if (
        cell[0] < 0 ||
        cell[0] > 8 ||
        cell[1] < 0 ||
        cell[1] > 6 ||
        OBSTACLES.has(key(cell)) ||
        parents.has(key(cell))
      )
        continue;
      parents.set(key(cell), current);
      queue.push(cell);
    }
  }
  return [];
}
