export interface WatchlistItem {
  name: string;
  code: string;
  theme: string;
  changePct: number;
  isHeld: boolean;
  addedAt: string;
  note: string;
}

export const watchlistItems: WatchlistItem[] = [
  {
    name: "广发纳斯达克100ETF联接(QDII)A",
    code: "270042",
    theme: "纳指100/QDII",
    changePct: 1.36,
    isHeld: false,
    addedAt: "2026-06-21",
    note: "关注费率和跟踪误差，和当前纳指持仓做长期对照。",
  },
  {
    name: "华夏国证半导体芯片ETF联接A",
    code: "012969",
    theme: "半导体",
    changePct: 2.18,
    isHeld: false,
    addedAt: "2026-06-24",
    note: "半导体板块观察，先记录波动和持有理由，不急着操作。",
  },
  {
    name: "大成中证红利指数A",
    code: "090010",
    theme: "红利",
    changePct: 0.74,
    isHeld: false,
    addedAt: "2026-06-18",
    note: "用于红利方向备选，重点看回撤和分红稳定性。",
  },
];
