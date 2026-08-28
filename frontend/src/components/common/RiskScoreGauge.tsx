import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface RiskScoreGaugeProps {
  score: number; // 0 to 100
  title: string;
  type?: 'fraud' | 'trust';
  size?: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  title,
  type = 'fraud',
  size = 110,
}) => {
  // Fraud score: 0-30 Low (Green), 31-70 Medium (Amber), 71-100 High (Red)
  // Trust score: 0-30 Low (Red), 31-70 Medium (Amber), 71-100 High (Green)
  let color = '#10B981'; // Green
  let riskLabel = 'LOW RISK';

  if (type === 'fraud') {
    if (score > 70) {
      color = '#EF4444'; // Red
      riskLabel = 'HIGH RISK';
    } else if (score > 30) {
      color = '#F59E0B'; // Amber
      riskLabel = 'MEDIUM RISK';
    } else {
      color = '#10B981';
      riskLabel = 'LOW RISK';
    }
  } else {
    // Trust score
    if (score >= 70) {
      color = '#10B981';
      riskLabel = 'HIGH TRUST';
    } else if (score >= 30) {
      color = '#F59E0B';
      riskLabel = 'MEDIUM TRUST';
    } else {
      color = '#EF4444';
      riskLabel = 'LOW TRUST';
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background track circle */}
        <CircularProgress
          variant="determinate"
          sx={{ color: (theme) => (theme.palette.mode === 'dark' ? '#1F2937' : '#E2E8F0') }}
          size={size}
          thickness={4.5}
          value={100}
        />
        {/* Foreground dynamic circle */}
        <CircularProgress
          variant="determinate"
          sx={{
            color: color,
            position: 'absolute',
            left: 0,
            strokeLinecap: 'round',
          }}
          size={size}
          thickness={4.5}
          value={Math.min(100, Math.max(0, score))}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {score.toFixed(0)}%
          </Typography>
          <Typography variant="caption" sx={{ color: color, fontWeight: 700, fontSize: '0.65rem', mt: 0.5 }}>
            {riskLabel}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}>
        {title}
      </Typography>
    </Box>
  );
};
