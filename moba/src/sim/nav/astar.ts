import type { Vec2 } from '../../core/vec2';
import type { NavGrid } from './grid';

const SQRT2 = Math.SQRT2;
// 8 方向邻居
const DX = [1, -1, 0, 0, 1, 1, -1, -1];
const DY = [0, 0, 1, -1, 1, -1, 1, -1];

/**
 * 网格 A*：八方向、禁止斜穿墙角、八方向距离启发、二叉堆开放表。
 * 数组复用 + “代数”标记，多次寻路不重复分配内存。
 */
export class AStar {
  private readonly g: Float64Array;
  private readonly parent: Int32Array;
  private readonly openGen: Uint32Array;
  private readonly closedGen: Uint32Array;
  private gen = 0;
  private readonly heap: Int32Array;
  private readonly heapF: Float64Array;
  private heapSize = 0;
  /** 最近一次搜索展开的节点数（调试 / 性能统计用） */
  lastExpanded = 0;

  constructor(private readonly grid: NavGrid) {
    const n = grid.w * grid.h;
    this.g = new Float64Array(n);
    this.parent = new Int32Array(n);
    this.openGen = new Uint32Array(n);
    this.closedGen = new Uint32Array(n);
    this.heap = new Int32Array(n);
    this.heapF = new Float64Array(n);
  }

  /**
   * 求从 start 到 goal 的路径（世界坐标拐点序列，不含起点，含终点）。
   * 起点 / 终点在障碍里时自动吸附到最近可走格。无路可走返回 null。
   */
  findPath(start: Vec2, goal: Vec2, maxExpand = 60000): Vec2[] | null {
    const grid = this.grid;
    const s0 = grid.toCell(start);
    const g0 = grid.toCell(goal);
    const s = grid.nearestWalkable(s0.cx, s0.cy, 8);
    const t = grid.nearestWalkable(g0.cx, g0.cy, 40);
    if (!s || !t) return null;
    const goalSnapped = t.cx !== g0.cx || t.cy !== g0.cy;
    const goalPos = goalSnapped ? grid.cellCenter(t.cx, t.cy) : { x: goal.x, y: goal.y };

    // 直线可达时直接返回，省去搜索
    if (grid.walkableAt(start) && grid.lineWalkable(start, goalPos)) {
      this.lastExpanded = 0;
      return [goalPos];
    }

    const W = grid.w;
    const startIdx = s.cy * W + s.cx;
    const goalIdx = t.cy * W + t.cx;
    this.gen++;
    if (this.gen === 0xffffffff) {
      this.openGen.fill(0);
      this.closedGen.fill(0);
      this.gen = 1;
    }
    const gen = this.gen;
    this.heapSize = 0;
    this.g[startIdx] = 0;
    this.parent[startIdx] = -1;
    this.openGen[startIdx] = gen;
    this.push(startIdx, this.h(s.cx, s.cy, t.cx, t.cy));

    let expanded = 0;
    let found = false;
    while (this.heapSize > 0) {
      const cur = this.pop();
      if (this.closedGen[cur] === gen) continue;
      this.closedGen[cur] = gen;
      if (cur === goalIdx) {
        found = true;
        break;
      }
      if (++expanded > maxExpand) break;
      const cx = cur % W;
      const cy = (cur - cx) / W;
      for (let k = 0; k < 8; k++) {
        const nx = cx + DX[k]!;
        const ny = cy + DY[k]!;
        if (grid.blocked(nx, ny)) continue;
        const diag = k >= 4;
        // 斜走时两侧正交格都必须可走，禁止擦墙角
        if (diag && (grid.blocked(cx + DX[k]!, cy) || grid.blocked(cx, cy + DY[k]!))) continue;
        const ni = ny * W + nx;
        if (this.closedGen[ni] === gen) continue;
        const ng = this.g[cur]! + (diag ? SQRT2 : 1);
        if (this.openGen[ni] === gen && ng >= this.g[ni]!) continue;
        this.openGen[ni] = gen;
        this.g[ni] = ng;
        this.parent[ni] = cur;
        this.push(ni, ng + this.h(nx, ny, t.cx, t.cy));
      }
    }
    this.lastExpanded = expanded;
    if (!found) return null;

    // 回溯得到格子序列
    const cells: Vec2[] = [];
    for (let i = goalIdx; i !== -1; i = this.parent[i]!) {
      const cx = i % W;
      cells.push(grid.cellCenter(cx, (i - cx) / W));
    }
    cells.reverse();
    cells[cells.length - 1] = goalPos;
    return smoothPath(grid, start, cells);
  }

  private h(ax: number, ay: number, bx: number, by: number): number {
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return dx + dy + (SQRT2 - 2) * Math.min(dx, dy);
  }

  private push(idx: number, f: number): void {
    let i = this.heapSize++;
    const heap = this.heap;
    const hf = this.heapF;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (hf[p]! <= f) break;
      heap[i] = heap[p]!;
      hf[i] = hf[p]!;
      i = p;
    }
    heap[i] = idx;
    hf[i] = f;
  }

  private pop(): number {
    const heap = this.heap;
    const hf = this.heapF;
    const top = heap[0]!;
    const n = --this.heapSize;
    if (n > 0) {
      const idx = heap[n]!;
      const f = hf[n]!;
      let i = 0;
      for (;;) {
        let c = i * 2 + 1;
        if (c >= n) break;
        if (c + 1 < n && hf[c + 1]! < hf[c]!) c++;
        if (hf[c]! >= f) break;
        heap[i] = heap[c]!;
        hf[i] = hf[c]!;
        i = c;
      }
      heap[i] = idx;
      hf[i] = f;
    }
    return top;
  }
}

/**
 * 路径平滑（拉绳法）：从当前点出发，尽量直连到更远的可见拐点。
 * 返回不含起点的拐点序列。
 */
export function smoothPath(grid: NavGrid, start: Vec2, cells: Vec2[]): Vec2[] {
  if (cells.length === 0) return [];
  const out: Vec2[] = [];
  let anchor = start;
  let i = 0;
  while (i < cells.length) {
    // 从 anchor 出发向前延伸，直到视线被挡（线性复杂度）
    let far = i;
    for (let j = i + 1; j < cells.length; j++) {
      if (grid.lineWalkable(anchor, cells[j]!)) far = j;
      else break;
    }
    out.push(cells[far]!);
    anchor = cells[far]!;
    i = far + 1;
  }
  return out;
}
