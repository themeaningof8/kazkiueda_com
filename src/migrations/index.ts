import * as migration_20251230_034004 from "./20251230_034004";
import * as migration_20260104_140202_add_slug_status_index from "./20260104_140202_add_slug_status_index";

export const migrations = [
  {
    up: migration_20251230_034004.up,
    down: migration_20251230_034004.down,
    name: "20251230_034004",
  },
  {
    up: migration_20260104_140202_add_slug_status_index.up,
    down: migration_20260104_140202_add_slug_status_index.down,
    name: "20260104_140202_add_slug_status_index",
  },
];
