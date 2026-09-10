import React from "react";
import { DEMO_MESSAGE, isReadOnlyDemo } from "../../../shared/api/demoMode";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

import { useAppDispatch } from "../../../app/store";

import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { PageLoader } from "../../../shared/ui/PageLoader";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ErrorState } from "../../../shared/ui/ErrorState";
import { getRtkQueryErrorMessage } from "../../../shared/utils/getRtkQueryErrorMessage";
import {ConfirmDialog} from "../../../shared/ui/ConfirmDialog";
import { snackbarMessages } from "../../../shared/ui/snackbar.constants";
import { showError, showInfo, showSuccess } from "../../../shared/ui/snackbar.utils";

import {
  useDeleteSoundMutation,
  useGetOwnersQuery,
  useGetSoundsQuery,
} from "../api/soundsApiSlice";

import { useSoundFilters } from "../hooks/useSoundFilters";
import SoundFilters from "../components/SoundFilters";
import { getSoundsEmptyMessage } from "../model/sound.emptyState";
// import type { SoundType } from "../model/types";
import type { OwnerSetupChecklistItem } from "../../owners/model/types";
import SoundCardsGrid from "../components/SoundCardsGrid";
import SoundCard from "../components/SoundCard";

type ViewMode = 'list' | 'grid';

export default function SoundsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const initialOwnerId = searchParams.get("ownerId") || "";

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');

  const {
    data: sounds = [],
    isLoading: soundsLoading,
    error: soundsError,
  } = useGetSoundsQuery();

  const {
    data: owners = [],
    isLoading: ownersLoading,
    error: ownersError,
  } = useGetOwnersQuery();

  const [deleteSound, { isLoading: deleting }] = useDeleteSoundMutation();
  const deleteInProgress = React.useRef(false);

  const {
    search,
    setSearch,
    selectedType,
    setSelectedType,
    selectedOwnerId,
    setSelectedOwnerId,
    missingAudioOnly,
    setMissingAudioOnly,
    filteredSounds,
  } = useSoundFilters(sounds, initialOwnerId);

  const ownerMap = React.useMemo(() => {
    return Object.fromEntries(
      owners.map(owner => [owner.id, owner])
    );
  }, [owners]);

  const emptyMessage = getSoundsEmptyMessage({
    totalSounds: sounds.length,
    selectedOwnerId,
    search,
    selectedType,
    missingAudioOnly,
  });

  const handleCreate = React.useCallback(() => {
    if (selectedOwnerId) {
      navigate(`/sounds/new?ownerId=${selectedOwnerId}`);
      return;
    }

    navigate("/sounds/new");
  }, [navigate, selectedOwnerId]);

  const handleOpenRequiredSetupItem = React.useCallback(
    (ownerId: string, item: OwnerSetupChecklistItem) => {
      if (item.soundId) {
        navigate(`/sounds/${item.soundId}`);
        return;
      }

      const params = new URLSearchParams({
        ownerId,
        type: item.soundType,
      });

      navigate(`/sounds/new?${params.toString()}`);
    },
    [navigate]
  );

  const handleEdit = React.useCallback(
    (id: string) => {
      navigate(`/sounds/${id}`);
    },
    [navigate]
  );

  const handleAskDelete = React.useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (isReadOnlyDemo()) {
      showInfo(dispatch, DEMO_MESSAGE);
      setDeleteId(null);
      return;
    }
    if (!deleteId || deleteInProgress.current) return;
    deleteInProgress.current = true;

    try {
      const result = await deleteSound(deleteId).unwrap();
      if (result.warning) showInfo(dispatch, result.warning);
      else showSuccess(dispatch, snackbarMessages.soundDeleted);
    } catch (error) {
      showError(
        dispatch,
        getRtkQueryErrorMessage(error) || "Failed to delete sound"
      );
    } finally {
      deleteInProgress.current = false;
      setDeleteId(null);
    }
  }, [deleteId, deleteSound, dispatch]);

  if (soundsLoading || ownersLoading) {
    return <PageLoader />;
  }

  const errorMessage = getRtkQueryErrorMessage(soundsError || ownersError);
  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Sound Manager"
        subtitle="Portfolio demo for managing audio records"
        action={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}>
              <IconButton
                aria-label={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
                onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <GridViewIcon /> : <ViewListIcon />}
              </IconButton>
            </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            New Sound
          </Button>
          </Stack>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <SoundFilters
              search={search}
              selectedType={selectedType}
              selectedOwnerId={selectedOwnerId}
              owners={owners}
              missingAudioOnly={missingAudioOnly}
              onSearchChange={setSearch}
              onTypeChange={setSelectedType}
              onOwnerChange={setSelectedOwnerId}
              onMissingAudioOnlyChange={setMissingAudioOnly}
            />
          </CardContent>
        </Card>

        {filteredSounds.length === 0 ? (
          <Box>
            <EmptyState message={emptyMessage} />
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={2}>
            {filteredSounds.map(sound => {
              const owner = ownerMap[sound.ownerId];
              return (
                <Grid key={sound.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <SoundCard
                    sound={sound}
                    ownerName={owner?.name || "Unknown owner"}
                    ownerType={owner?.type || sound.ownerType}
                    owner={owner}
                    sounds={sounds}
                    onEdit={handleEdit}
                    onDelete={handleAskDelete}
                    onOpenRequiredSetupItem={handleOpenRequiredSetupItem}
                  />
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <SoundCardsGrid
            sounds={filteredSounds}
            allSounds={sounds}
            ownerMap={ownerMap}
            onEdit={handleEdit}
            onDelete={handleAskDelete}
            onOpenRequiredSetupItem={handleOpenRequiredSetupItem}
          />
        )}
      </Stack>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this sound?"
        confirmText="Delete"
        busy={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}
