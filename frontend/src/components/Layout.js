import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
    AppBar, Box, CssBaseline, Drawer, IconButton,
    List,  ListItemIcon, ListItemText, ListItemButton,
    Toolbar, Typography, Divider, Avatar, Chip, Badge,
    Collapse, useTheme, alpha, Paper, Stack, Tooltip,
    Menu, MenuItem, Fade, 
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard as DashboardIcon, Assignment as AssignmentIcon,
    Apartment as DepartmentIcon, Warehouse as WarehouseIcon, People as PeopleIcon,
    Settings as SettingsIcon, Logout as LogoutIcon, BarChart as ReportIcon,
    ExpandLess, ExpandMore, Notifications as NotificationsIcon,
    AccountCircle, 
} from '@mui/icons-material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280;

const menuConfig = {
  admin: [
    { label: "แดชบอร์ด", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "จัดการผู้ใช้", icon: <PeopleIcon />, path: "/settings/Users" },
    { label: "ใบขอเบิก", icon: <HowToRegIcon />, path: "/requisitions/create" },
    { label: "อนุมัติคำขอ", icon: <HowToRegIcon />, path: "/approvals" },
    { label: "ออกจากระบบ", icon: <LogoutIcon />, path: "/logout" },
    { label: "รายงาน", icon: <ReportIcon />, path: "/reports" },
    { label: "การตั้งค่า", icon: <SettingsIcon />, path: "/settings" },
    { label: "จัดการวัสดุ", icon: <WarehouseIcon />, path: "/materials/Materials" },
  ],
  staff: [
    { label: "แดชบอร์ด", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "สร้างคำขอเบิก", icon: <AssignmentAddIcon />, path: "/requisitions/create" },
    { label: "ประวัติการเบิก", icon: <AssignmentIcon />, path: "/requisitions/history" },
    { label: "ออกจากระบบ", icon: <LogoutIcon />, path: "/logout" },
  ],
  approver: [
    { label: "แดชบอร์ด", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "อนุมัติคำขอ", icon: <HowToRegIcon />, path: "/approvals" },
    { label: "ออกจากระบบ", icon: <LogoutIcon />, path: "/logout" },
  ],
};

const Layout = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menu = menuConfig[user?.role] || [];
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'ผู้ใช้งาน';
    const departmentName = user.department.department_name || 'ไม่ระบุหน่วยงาน';
    const userInitials = fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        // Auto-expand current menu section if needed
    }, []);

    const handleLogout = async () => {
        try {
            await import('../services/api').then(api => api.logout());
        } catch {}
        setUser(null);
        navigate('/login');
    };

    const handleMenuClick = async (item) => {
      if (item.path === "/logout") {
        await handleLogout();
      } else {
        navigate(item.path);
      }
    };

    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              ระบบเบิกของหน่วยงานจ่ายกลาง
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* ข้อมูลผู้ใช้ */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box textAlign="right">
                <Typography variant="body1">{fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{departmentName}</Typography>
              </Box>
              <Tooltip title={fullName}>
                <Avatar>{userInitials}</Avatar>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow:1, overflow: 'auto' }}>
            <List>
              {menu.filter(item => item.path !== "/logout").map((item) => (
                <ListItemButton
                  key={item.label}
                  selected={location.pathname === item.path}
                  onClick={() => handleMenuClick(item)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/*ปุ่ม Logout ด้านล่าง */}
          <Box>
            <Divider />
            <List>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="ออกจากระบบ" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    );
};

export default Layout;