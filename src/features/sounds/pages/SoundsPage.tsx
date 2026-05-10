import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useAppDispatch } from "../../../app/store";

import PageContainer from "../../ui/PageContainer";
import PageHeader from "../../ui/PageHeader";
import PageLoader from "../../ui/PageLoader";
import EmptyState from "../../ui/EmptyState";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { snackbarMessages } from "../../ui/snackbar.constants";
import { showError, showSuccess } from "../../ui/snackbar.utils";

import {
  useDeleteSoundMutation,
  useGetOwnersQuery,
  useGetSoundsQuery,
} from "../api/adminApiSlice";

import { useSoundFilters } from "../hooks/useSoundFilters";
import SoundFilters from "../components/SoundFilters";
import SoundCard from "../components/SoundCard";
import { getSoundsEmptyMessage } from "../model/sound.emptyState";
// import type { SoundType } from "../model/types";
import type { OwnerSetupChecklistItem } from "../../owners/model/types";
export default function SoundsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const initialOwnerId = searchParams.get("ownerId") || "";

  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const {
    data: sounds = [],
    isLoading: soundsLoading,
  } = useGetSoundsQuery();

  const {
    data: owners = [],
    isLoading: ownersLoading,
  } = useGetOwnersQuery();

  const [deleteSound] = useDeleteSoundMutation();

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
    if (!deleteId) return;

    try {
      await deleteSound(deleteId).unwrap();
      showSuccess(dispatch, snackbarMessages.soundDeleted);
    } catch (error) {
      showError(
        dispatch,
        error instanceof Error
          ? error.message
          : "Failed to delete sound"
      );
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, deleteSound, dispatch]);

  if (soundsLoading || ownersLoading) {
    return <PageLoader />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Sound Manager"
        subtitle="Portfolio demo for managing audio records"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            New Sound
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
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
          <Box sx={{ py: 8, textAlign: "center" }}>
            <EmptyState message={emptyMessage} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredSounds.map(sound => (
              <Grid
                key={sound.id}
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <SoundCard
                  sound={sound}
                  ownerName={
                    ownerMap[sound.ownerId]?.name || "Unknown owner"
                  }
                  ownerType={
                    ownerMap[sound.ownerId]?.type || sound.ownerType
                  }
                  owner={ownerMap[sound.ownerId]}
                  sounds={sounds}
                  onEdit={handleEdit}
                  onDelete={handleAskDelete}
                  onOpenRequiredSetupItem={handleOpenRequiredSetupItem}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this sound?"
        confirmText="Delete"
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}