import type { OwnerType } from "./types";

export interface OwnerRow {
  id: string;
  name: string;
  type: OwnerType;
  extension: string | null;
  created_at: string;
}