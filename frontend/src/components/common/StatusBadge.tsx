import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon,
  Send as SubmittedIcon,
} from '@mui/icons-material';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  let color: ChipProps['color'] = 'default';
  let icon = <PendingIcon fontSize="small" />;
  let label = status;

  switch (status?.toUpperCase()) {
    case 'APPROVED':
      color = 'success';
      icon = <ApprovedIcon fontSize="small" />;
      label = 'Approved';
      break;
    case 'REJECTED':
      color = 'error';
      icon = <RejectedIcon fontSize="small" />;
      label = 'Rejected';
      break;
    case 'UNDER_REVIEW':
      color = 'warning';
      icon = <WarningIcon fontSize="small" />;
      label = 'Under Review';
      break;
    case 'SUBMITTED':
      color = 'info';
      icon = <SubmittedIcon fontSize="small" />;
      label = 'Submitted';
      break;
    case 'ACTION_REQUIRED':
      color = 'warning';
      icon = <WarningIcon fontSize="small" />;
      label = 'Action Required';
      break;
    default:
      color = 'default';
      label = status || 'Draft';
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size={size}
      sx={{
        fontWeight: 700,
        letterSpacing: '0.3px',
        px: 0.5,
      }}
    />
  );
};
