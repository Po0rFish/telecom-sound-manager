import type {
  Owner,
  OwnerType,
} from "./types";

import type {
  Sound,
  SoundType,
} from "../../sounds/model/types";

import type {
  ChecklistItemStatus,
  OwnerSetupChecklistItem,
  OwnerSetupStatus,
  OwnerSoundStats,
} from "./types";

const expectedSoundTypesByOwnerType: Record<
  OwnerType,
  Array<{
    soundType: SoundType;
    label: string;
  }>
> = {
  Company: [
    {
      soundType: "Greeting",
      label: "Main greeting",
    },
    {
      soundType: "Announcement",
      label: "Company announcement",
    },
    {
      soundType: "MusicOnHold",
      label: "Music on hold",
    },
  ],

  Department: [
    {
      soundType: "Greeting",
      label: "Department greeting",
    },
    {
      soundType: "Announcement",
      label: "Department announcement",
    },
  ],

  Queue: [
    {
      soundType: "Queue",
      label: "Queue message",
    },
    {
      soundType: "MusicOnHold",
      label: "Music on hold",
    },
    {
      soundType: "Announcement",
      label: "Queue announcement",
    },
  ],

  User: [
    {
      soundType: "Voicemail",
      label: "Voicemail greeting",
    },
  ],
};

const getChecklistItem = (
  ownerSounds: Sound[],
  soundType: SoundType,
  label: string
): OwnerSetupChecklistItem => {
  const matchingSounds = ownerSounds.filter(
    sound => sound.type === soundType
  );

  if (matchingSounds.length === 0) {
    return {
      soundType,
      label,
      status: "Not created",
    };
  }

  const readySound = matchingSounds.find(
    sound => sound.isActive && Boolean(sound.audioUrl)
  );
  
  if (readySound) {
    return {
      soundType,
      label,
      status: "Ready",
      soundId: readySound.id,
    };
  }

  const missingFileSound = matchingSounds.find(
    sound => !sound.audioUrl
  );

  if (missingFileSound) {
    return {
      soundType,
      label,
      status: "Missing file",
      soundId: missingFileSound.id,
    };
  }

  const inactiveSound = matchingSounds.find(
    sound => !sound.isActive
  );

  return {
    soundType,
    label,
    status: "Inactive",
    soundId: inactiveSound?.id || matchingSounds[0].id,
  };
};

export const getOwnerSetupChecklist = (
  owner: Owner,
  sounds: Sound[]
): OwnerSetupChecklistItem[] => {
  const ownerSounds = sounds.filter(sound => sound.ownerId === owner.id);

  return expectedSoundTypesByOwnerType[owner.type].map(item =>
    getChecklistItem(
      ownerSounds,
      item.soundType,
      item.label
    )
  );
};

const getOwnerSetupStatus = (
  totalSounds: number,
  checklist: OwnerSetupChecklistItem[]
): OwnerSetupStatus => {
  if (totalSounds === 0) {
    return "No sounds";
  }

  const hasMissingFile = checklist.some(
    item => item.status === "Missing file"
  );

  if (hasMissingFile) {
    return "Needs audio";
  }

  const hasNotCreated = checklist.some(
    item => item.status === "Not created"
  );

  if (hasNotCreated) {
    return "Incomplete";
  }

  const hasInactive = checklist.some(
    item => item.status === "Inactive"
  );

  if (hasInactive) {
    return "Inactive";
  }

  return "Ready";
};

export const getOwnerSoundStats = (
  owner: Owner,
  sounds: Sound[]
): OwnerSoundStats => {
  const ownerSounds = sounds.filter(sound => sound.ownerId === owner.id);

  const totalSounds = ownerSounds.length;
  const missingFiles = ownerSounds.filter(sound => !sound.audioUrl).length;
  const activeSounds = ownerSounds.filter(sound => sound.isActive).length;
  const inactiveSounds = totalSounds - activeSounds;

  const checklist = getOwnerSetupChecklist(owner, sounds);

  const requiredItems = checklist.length;

  const readyItems = checklist.filter(
    item => item.status === "Ready"
  ).length;

  const missingFileItems = checklist.filter(
    item => item.status === "Missing file"
  ).length;

  const inactiveItems = checklist.filter(
    item => item.status === "Inactive"
  ).length;

  const notCreatedItems = checklist.filter(
    item => item.status === "Not created"
  ).length;

  const status = getOwnerSetupStatus(totalSounds, checklist);

  return {
    totalSounds,
    missingFiles,
    activeSounds,
    inactiveSounds,

    requiredItems,
    readyItems,
    missingFileItems,
    inactiveItems,
    notCreatedItems,

    status,
  };
};

export const getOwnerStatusColor = (
  status: OwnerSetupStatus
): "success" | "warning" | "default" | "error" => {
  if (status === "Ready") {
    return "success";
  }

  if (status === "Needs audio") {
    return "warning";
  }

  if (status === "Incomplete") {
    return "error";
  }

  return "default";
};

export const getChecklistStatusColor = (
  status: ChecklistItemStatus
): "success" | "warning" | "default" | "error" => {
  if (status === "Ready") {
    return "success";
  }

  if (status === "Missing file") {
    return "warning";
  }

  if (status === "Not created") {
    return "error";
  }

  return "default";
};