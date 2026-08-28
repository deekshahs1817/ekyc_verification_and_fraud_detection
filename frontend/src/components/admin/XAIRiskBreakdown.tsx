import React from 'react';
import { Paper, Box, Typography, Chip, LinearProgress, Stack } from '@mui/material';
import { WarningAmber as AlertIcon, CheckCircleOutline as SafeIcon } from '@mui/icons-material';
import { XAIRiskFactor } from '../../api/kycApi';

interface XAIRiskBreakdownProps {
  factors: XAIRiskFactor[] | undefined;
  amlFlag: boolean;
  amlReasons?: string[];
}

export const XAIRiskBreakdown: React.FC<XAIRiskBreakdownProps> = ({
  factors,
  amlFlag,
  amlReasons,
}) => {
  return (
    <Paper sx={{ p: 2.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AlertIcon sx={{ color: '#F59E0B' }} />
        Explainable AI (XAI) Risk Factors & Attribution
      </Typography>

      {/* AML Alerts if present */}
      {amlFlag && amlReasons && amlReasons.length > 0 && (
        <Box sx={{ mb: 2.5, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2', border: '1px solid #EF4444', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#EF4444', fontWeight: 700, mb: 1 }}>
            Mandatory AML Policy Alerts ({amlReasons.length})
          </Typography>
          <Stack spacing={0.8}>
            {amlReasons.map((reason, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#FCA5A5' : '#B91C1C', fontSize: '0.85rem' }}>
                • {reason}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}

      {/* Top Feature Attributions */}
      {factors && factors.length > 0 ? (
        <Stack spacing={2}>
          {factors.map((factor, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {factor.feature}
                </Typography>
                <Chip
                  label={factor.impact}
                  size="small"
                  color={factor.impact === 'HIGH' ? 'error' : factor.impact === 'MEDIUM' ? 'warning' : 'info'}
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                {factor.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, factor.contribution_score * 2.5)}
                  color={factor.impact === 'HIGH' ? 'error' : 'warning'}
                  sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1F2937' : '#E2E8F0' }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 40 }}>
                  +{factor.contribution_score.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3, color: '#10B981' }}>
          <SafeIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            No critical risk anomalies identified
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Document metadata, biometrics, and checksums align cleanly with official benchmarks.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
