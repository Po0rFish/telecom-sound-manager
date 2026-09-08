import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Grid,
  Stack,
} from "@mui/material";

import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import {PageLoader} from "../../../shared/ui/PageLoader";
import {EmptyState} from "../../../shared/ui/EmptyState";
import {ErrorState} from "../../../shared/ui/ErrorState";

import {
  useGetOwnersQuery,
  useGetSoundsQuery,
} from "../../sounds/api/soundsApiSlice";

import { getRtkQueryErrorMessage } from "../../../shared/utils/getRtkQueryErrorMessage";

import OwnerCard from "../components/OwnerCard";
import OwnerFilters from "../components/OwnerFilters";
import { useOwnerFilters } from "../hooks/useOwnerFilters";
import {
  getOwnerSetupChecklist,
  getOwnerSoundStats,
} from "../model/ownerSetup";

const PAGE_TITLE = "Owners";
const PAGE_SUBTITLE = "Telecom audio setup checklist by owner";

interface OwnersErrorPageProps {
  readonly message: string;
}

function OwnersErrorPage({ message }: OwnersErrorPageProps) {
  return (
    <PageContainer>
      <PageHeader title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} />

      <ErrorState message={message} />
    </PageContainer>
  );
}

export default function OwnersPage() {
  const navigate = useNavigate();
  const {
    data: owners = [],
    isLoading: ownersLoading,
    error: ownersError,
  } = useGetOwnersQuery();

  const {
    data: sounds = [],
    isLoading: soundsLoading,
    error: soundsError,
  } = useGetSoundsQuery();

  const ownersErrorMessage = getRtkQueryErrorMessage(ownersError);
  const soundsErrorMessage = getRtkQueryErrorMessage(soundsError);

  const ownersWithStats = React.useMemo(() => {
    return owners.map(owner => ({
      owner,
      stats: getOwnerSoundStats(owner, sounds),
      checklist: getOwnerSetupChecklist(owner, sounds),
    }));
  }, [owners, sounds]);

  const {
    search,
    setSearch,
    selectedType,
    setSelectedType,
    missingFilesOnly,
    setMissingFilesOnly,
    filteredOwners,
  } = useOwnerFilters(ownersWithStats);

  const handleViewSounds = React.useCallback(
    (ownerId: string) => {
      navigate(`/sounds?ownerId=${ownerId}`);
    },
    [navigate]
  );

  if (ownersLoading || soundsLoading) {
    return <PageLoader />;
  }

  if (ownersErrorMessage) {
    return <OwnersErrorPage message="Failed to load owners" />;
  }

  if (soundsErrorMessage) {
    return <OwnersErrorPage message="Failed to load sound statistics" />;
  }

  let ownersContent = <EmptyState message="No owners found" />;

  if (owners.length > 0 && filteredOwners.length === 0) {
    ownersContent = <EmptyState message="No owners match your filters" />;
  }

  if (filteredOwners.length > 0) {
    ownersContent = (
      <Grid container spacing={3}>
        {filteredOwners.map(({ owner, stats, checklist }) => (
          <Grid
            key={owner.id}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <OwnerCard
              owner={owner}
              stats={stats}
              checklist={checklist}
              onViewSounds={handleViewSounds}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} />

      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
          <CardContent>
            <OwnerFilters
              search={search}
              selectedType={selectedType}
              missingFilesOnly={missingFilesOnly}
              onSearchChange={setSearch}
              onTypeChange={setSelectedType}
              onMissingFilesOnlyChange={setMissingFilesOnly}
            />
          </CardContent>
        </Card>

        {ownersContent}
      </Stack>
    </PageContainer>
  );
}