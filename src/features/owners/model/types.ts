import type { SoundType } from "../../sounds/model/types";
export interface Owner {
  id: string;
  name: string;
  type: OwnerType;
  extension?: string;
}
export type OwnerType = "Company" | "Department" | "User" | "Queue";

export type OwnerSetupStatus =
  | "Ready"
  | "Needs audio"
  | "No sounds"
  | "Incomplete"
  | "Inactive";

export type ChecklistItemStatus =
  | "Ready"
  | "Missing file"
  | "Inactive"
  | "Not created";

export interface OwnerSetupChecklistItem {
  soundType: SoundType;
  label: string;
  status: ChecklistItemStatus;
  soundId?: string;
}

export interface OwnerSoundStats {
  totalSounds: number;
  missingFiles: number;
  activeSounds: number;
  inactiveSounds: number;

  requiredItems: number;
  readyItems: number;
  missingFileItems: number;
  inactiveItems: number;
  notCreatedItems: number;

  status: OwnerSetupStatus;
}