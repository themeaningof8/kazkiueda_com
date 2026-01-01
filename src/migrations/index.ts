import * as migration_20251230_034004 from "./20251230_034004";

export const migrations = [
  {
    up: migration_20251230_034004.up,
    down: migration_20251230_034004.down,
    name: "20251230_034004",
  },
];
