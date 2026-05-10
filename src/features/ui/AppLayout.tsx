import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import GroupsIcon from "@mui/icons-material/Groups";

interface AppLayoutProps {
  readonly children: ReactNode;
}

const drawerWidth = 220;

const navigationItems = [
  {
    label: "Sounds",
    path: "/sounds",
    icon: <GraphicEqIcon />,
  },
  {
    label: "Owners",
    path: "/owners",
    icon: <GroupsIcon />,
  },
];

const navItemSx = {
  mx: 1,
  borderRadius: 2,

  "&.Mui-selected": {
    bgcolor: "#eef2ff",
    color: "#4338ca",

    "& .MuiListItemIcon-root": {
      color: "#4338ca",
    },
  },

  "&.Mui-selected:hover": {
    bgcolor: "#e0e7ff",
  },
};

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeDrawer = () => {
    setMobileOpen(false);
  };

  const toggleDrawer = () => {
    setMobileOpen(prev => !prev);
  };

  const handleNavigate = (path: string) => {
    navigate(path);

    if (isMobile) {
      closeDrawer();
    }
  };

  const drawerContent = (
    <>
      <Toolbar />

      <List sx={{ mt: 2 }}>
        {navigationItems.map(item => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => handleNavigate(item.path)}
            sx={navItemSx}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              Telecom Admin
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar>A</Avatar>

            <Typography
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              Admin User
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={closeDrawer}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "#f5f7fb",
          p: { xs: 2, md: 3 },
          overflowX: "hidden",
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </Box>
  );
}