import { Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useGetOwnersQuery, useGetSoundsQuery } from "../../sounds/api/soundsApiSlice";
import { getDashboardStats } from "../model/dashboardStats";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { PageLoader } from "../../../shared/ui/PageLoader";
import { ErrorState } from "../../../shared/ui/ErrorState";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { getRtkQueryErrorMessage } from "../../../shared/utils/getRtkQueryErrorMessage";

export default function DashboardPage() {
  const ownersQuery = useGetOwnersQuery();
  const soundsQuery = useGetSoundsQuery();
  if (ownersQuery.isLoading || soundsQuery.isLoading) return <PageLoader />;
  const error = getRtkQueryErrorMessage(ownersQuery.error || soundsQuery.error);
  if (error) return <ErrorState message={error} />;
  const owners = ownersQuery.data ?? [];
  const stats = getDashboardStats(owners, soundsQuery.data ?? []);
  const metrics = [
    ["Total sounds", stats.totalSounds],
    ["With audio", stats.withAudio],
    ["Missing audio", stats.missingAudio],
    ["Complete configurations", stats.complete],
    ["Incomplete configurations", stats.incomplete.length],
    ...Object.entries(stats.configuredByType).map(([type, count]) => [`Configured ${type.toLowerCase()} owners`, count]),
  ] as const;
  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle="Telecom audio configuration overview" />
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">A configuration is complete when every required sound has audio and is active.</Typography>
        <Grid container spacing={2}>
          {metrics.map(([label, count]) => (
            <Grid key={label} size={{ xs: 6, sm: 4, lg: 3 }}>
              <Card sx={{ height: "100%" }}><CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>{label}</Typography>
                <Typography variant="h4" sx={{ mt: 1, fontVariantNumeric: "tabular-nums", color: (label === "Missing audio" || label === "Incomplete configurations") && Number(count) > 0 ? "warning.main" : "text.primary" }}>{count}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h5">Needs attention</Typography>
        {owners.length === 0 ? <EmptyState message="No owners configured yet" /> : stats.incomplete.length === 0 ? (
          <EmptyState message="All owners have their required audio ready" />
        ) : stats.incomplete.map(({ owner, stats: ownerStats, checklist }) => (
          <Card key={owner.id}><CardContent>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="h6">{owner.name}</Typography>
                <Chip size="small" label={ownerStats.status} />
              </Stack>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {checklist.filter(item => item.status !== "Ready").map(item => (
                  <Button key={item.soundType} component={Link} variant="outlined" to={item.soundId
                    ? `/sounds/${item.soundId}`
                    : `/sounds/new?${new URLSearchParams({ ownerId: owner.id, type: item.soundType })}`}>
                    {item.label}: {item.status}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </CardContent></Card>
        ))}
      </Stack>
    </PageContainer>
  );
}
