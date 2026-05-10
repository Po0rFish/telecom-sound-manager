interface GetSoundsEmptyMessageParams {
  readonly totalSounds: number;
  readonly selectedOwnerId: string;
  readonly search: string;
  readonly selectedType: string;
  readonly missingAudioOnly: boolean;
}

export const getSoundsEmptyMessage = ({
  totalSounds,
  selectedOwnerId,
  search,
  selectedType,
  missingAudioOnly,
}: GetSoundsEmptyMessageParams) => {
  if (totalSounds === 0) {
    return "No sounds created yet";
  }

  if (selectedOwnerId) {
    return "No sounds found for selected owner";
  }

  if (search.trim() || selectedType || missingAudioOnly) {
    return "No sounds match your filters";
  }

  return "No sounds found";
};