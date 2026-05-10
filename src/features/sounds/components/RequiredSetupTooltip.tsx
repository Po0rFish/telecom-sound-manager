import {
  Box,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
  tooltipClasses,
  type TooltipProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import type { Sound } from "../model/types";
import {
  getChecklistStatusColor,
  getOwnerSetupChecklist,
} from "../../owners/model/ownerSetup";
import type { Owner, OwnerSetupChecklistItem } from "../../owners/model/types";

interface RequiredSetupTooltipProps {
  readonly owner?: Owner;
  readonly sounds: Sound[];
  readonly showCompleteMessage?: boolean;
  readonly onSelectType?: (item: OwnerSetupChecklistItem) => void;
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    maxWidth: 360,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[3],
    borderRadius: 8,
    padding: theme.spacing(1.5),
  },
}));

export default function RequiredSetupTooltip({
  owner,
  sounds,
  showCompleteMessage = true,
  onSelectType,
}: RequiredSetupTooltipProps) {
  if (!owner) {
    return null;
  }

  const checklist = getOwnerSetupChecklist(owner, sounds);

  const remainingItems = checklist.filter(
    item => item.status !== "Ready"
  );

  if (remainingItems.length === 0) {
    if (!showCompleteMessage) {
      return null;
    }

    return (
      <Typography variant="body2" color="success.main">
        Required setup is complete.
      </Typography>
    );
  }

  return (
    <HtmlTooltip
      arrow
      placement="right"
      title={
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            Sounds still needed
          </Typography>

          <Stack spacing={1}>
            {remainingItems.map(item => (
              <Stack
                key={item.soundType}
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      onSelectType?.(item);
                    }}
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                  </Link>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Type: {item.soundType}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  color={getChecklistStatusColor(item.status)}
                  label={item.status}
                />
              </Stack>
            ))}
          </Stack>
        </Box>
      }
    >
      <Link
        component="button"
        type="button"
        underline="hover"
        sx={{
          fontSize: 14,
          width: "fit-content",
          textAlign: "left",
        }}
      >
        Required setup: {remainingItems.length} item
        {remainingItems.length > 1 ? "s" : ""} remaining
      </Link>
    </HtmlTooltip>
  );
}