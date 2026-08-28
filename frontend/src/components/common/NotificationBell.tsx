import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon,
  ArrowForward as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { notificationApi, AppNotification } from '../../api/notificationApi';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore in background
    }
  }, []);

  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getMyNotifications(30);
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Could not load notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll count every 15 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchAllNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Failed to mark read', err);
      }
    }

    if (notif.link) {
      handleClose();
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all read', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <SuccessIcon sx={{ color: '#10B981', fontSize: 20 }} />;
      case 'ERROR':
        return <ErrorIcon sx={{ color: '#EF4444', fontSize: 20 }} />;
      case 'WARNING':
        return <WarningIcon sx={{ color: '#F59E0B', fontSize: 20 }} />;
      default:
        return <InfoIcon sx={{ color: '#3B82F6', fontSize: 20 }} />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      if (!timestamp) return '';
      let cleanIso = timestamp.trim();
      // Ensure UTC ISO string has 'Z' suffix so browser treats it as UTC instead of local timezone
      if (!cleanIso.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(cleanIso)) {
        cleanIso = cleanIso.replace(' ', 'T') + 'Z';
      }
      const date = new Date(cleanIso);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 45) return 'Just now';
      if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Activity Notifications">
        <IconButton
          onClick={handleOpen}
          sx={{
            p: 1,
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 520,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 40px rgba(0, 0, 0, 0.6)'
                : '0 16px 36px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Activity Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} New`}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={handleMarkAllRead}
              sx={{ fontSize: '0.75rem', textTransform: 'none', py: 0.2 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Content list */}
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No notifications yet
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Submissions, reviews, AML alerts, and status changes will appear here in real-time.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notif) => {
                const unread = !notif.is_read;
                return (
                  <ListItem
                    key={notif.id}
                    button
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: unread
                        ? (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(59, 130, 246, 0.08)'
                              : 'rgba(59, 130, 246, 0.04)'
                        : 'transparent',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {getNotificationIcon(notif.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: unread ? 800 : 600,
                              color: 'text.primary',
                              fontSize: '0.85rem',
                            }}
                          >
                            {notif.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: unread ? 'primary.main' : 'text.secondary',
                              fontWeight: unread ? 700 : 500,
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap',
                              ml: 1,
                            }}
                          >
                            {formatRelativeTime(notif.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notif.message}
                          </Typography>
                          {notif.link && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                View Details
                              </Typography>
                              <OpenIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    {unread && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          ml: 1,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 1.2, textAlign: 'center', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Real-time synchronization for compliance activities
          </Typography>
        </Box>
      </Popover>
    </>
  );
};
