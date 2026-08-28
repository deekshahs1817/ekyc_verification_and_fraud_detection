import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { CloudUpload as UploadIcon, CheckCircle as SuccessIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface DocumentUploadZoneProps {
  label: string;
  sublabel: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  label,
  sublabel,
  accept = 'image/*',
  onFileSelect,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      onFileSelect(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Paper
      elevation={0}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      sx={{
        p: 2.5,
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : (selectedFile ? 'success.main' : 'divider'),
        bgcolor: isDragOver
          ? (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#E2E8F0')
          : (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
        borderRadius: 3,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      component="label"
    >
      <input
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {previewUrl ? (
        <Box sx={{ width: '100%', position: 'relative' }}>
          <img
            src={previewUrl}
            alt="Upload Preview"
            style={{
              maxHeight: 140,
              maxWidth: '100%',
              borderRadius: 8,
              objectFit: 'contain',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
            <SuccessIcon sx={{ color: 'success.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {selectedFile?.name}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleFileChange(null);
              }}
              sx={{ color: '#EF4444' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              color: 'primary.main',
            }}
          >
            <UploadIcon />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {sublabel}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Supports JPG, PNG, WEBP (Max 15MB)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
