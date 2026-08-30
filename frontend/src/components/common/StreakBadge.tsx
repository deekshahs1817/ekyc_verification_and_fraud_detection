import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Popover,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import {
  LocalFireDepartment as FireIcon,
  CheckCircle as CheckIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { getDeveloperStreak } from "../../services/streakService";

export const StreakBadge: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const streak = getDeveloperStreak();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Chip
        icon={<FireIcon sx={{ color: "#F97316 !important", fontSize: 20 }} />}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography component="span" sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#F97316" }}>
              {streak.currentStreak}-Day Streak
            </Typography>
          </Box>
        }
        onClick={handleOpen}
        sx={{
          bgcolor: "rgba(249, 115, 22, 0.12)",
          border: "1.5px solid rgba(249, 115, 22, 0.4)",
          cursor: "pointer",
          px: 0.5,
          py: 2,
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          boxShadow: "0 0 12px rgba(249, 115, 22, 0.15)",
          "&:hover": {
            bgcolor: "rgba(249, 115, 22, 0.22)",
            boxShadow: "0 0 16px rgba(249, 115, 22, 0.3)",
            transform: "translateY(-1px)",
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 360,
            borderRadius: 3,
            p: 2.5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "rgba(249, 115, 22, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(249, 115, 22, 0.3)",
            }}
          >
            <FireIcon sx={{ color: "#F97316", fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {streak.currentStreak}-Day Active Streak 🔥
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Continuous Daily Project Work
            </Typography>
          </Box>
          <Chip
            size="small"
            label="ON TRACK"
            sx={{
              bgcolor: "rgba(16, 185, 129, 0.15)",
              color: "#10B981",
              fontWeight: 800,
              fontSize: "0.68rem",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Verified Work Log
        </Typography>

        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {streak.history.map((day) => (
            <Paper
              key={day.date}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: day.status === "ACTIVE_TODAY" ? "rgba(59, 130, 246, 0.05)" : "rgba(16, 185, 129, 0.05)",
                borderColor: day.status === "ACTIVE_TODAY" ? "primary.main" : "success.main",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 0.8 }}>
                  <CheckIcon sx={{ color: "#10B981", fontSize: 16 }} />
                  {day.label}
                </Typography>
                <Chip
                  size="small"
                  label={day.status === "ACTIVE_TODAY" ? "Active Today" : "Completed"}
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: day.status === "ACTIVE_TODAY" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                    color: day.status === "ACTIVE_TODAY" ? "#3B82F6" : "#10B981",
                  }}
                />
              </Box>

              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                {day.activitiesCount} tasks & contributions completed
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <TrophyIcon sx={{ color: "#FBBF24", fontSize: 18 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Streak preserved across refreshes & database updates.
          </Typography>
        </Box>
      </Popover>
    </>
  );
};