import { Outlet, NavLink } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { DEMO_MESSAGE } from '../api/demoMode';

import './AppLayout.scss';

export function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar">
        <Typography variant="h6" className="app-layout__logo">
          Sound Manager
        </Typography>

        <Stack spacing={1}>
          <Button component={NavLink} to="/dashboard" fullWidth className="app-layout__nav-link">
            Dashboard
          </Button>
          <Button
            component={NavLink}
            to="/sounds"
            fullWidth
            className="app-layout__nav-link"
          >
            Sounds
          </Button>

          <Button
            component={NavLink}
            to="/owners"
            fullWidth
            className="app-layout__nav-link"
          >
            Owners
          </Button>
        </Stack>
      </aside>

      <div className="app-layout__content">
        <header className="app-layout__header">
          <div>
            <Typography variant="h6">
              Telephony Sound Manager
            </Typography>

            <Typography variant="body2" color="text.secondary">
              VoIP audio files management dashboard
            </Typography>
          </div>
        </header>

        <main className="app-layout__main">
          <Alert severity="info" sx={{ mb: 2 }}>{DEMO_MESSAGE}</Alert>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
