import type { Owner } from "../../owners/model/types";
import type { Sound } from "../../sounds/model/types";
import { getOwnerSetupChecklist, getOwnerSoundStats } from "../../owners/model/ownerSetup.ts";

export function getDashboardStats(owners: Owner[], sounds: Sound[]) {
  const setups = owners.map(owner => ({
    owner,
    stats: getOwnerSoundStats(owner, sounds),
    checklist: getOwnerSetupChecklist(owner, sounds),
  }));
  const complete = setups.filter(item => item.stats.status === "Ready");
  return {
    totalSounds: sounds.length,
    withAudio: sounds.filter(sound => Boolean(sound.audioUrl)).length,
    missingAudio: sounds.filter(sound => !sound.audioUrl).length,
    complete: complete.length,
    incomplete: setups.filter(item => item.stats.status !== "Ready"),
    configuredByType: {
      Company: complete.filter(item => item.owner.type === "Company").length,
      Department: complete.filter(item => item.owner.type === "Department").length,
      Queue: complete.filter(item => item.owner.type === "Queue").length,
      User: complete.filter(item => item.owner.type === "User").length,
    },
  };
}
