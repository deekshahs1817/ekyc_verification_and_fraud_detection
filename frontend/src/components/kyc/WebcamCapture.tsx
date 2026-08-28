import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Tabs, Tab, IconButton } from '@mui/material';
import {
  CameraAlt as CameraIcon,
  CheckCircle as SuccessIcon,
  Refresh as RetakeIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface WebcamCaptureProps {
  onCapture: (file: File | null) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Webcam, 1 = Upload
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // When camera active state changes or video element mounts, attach stream
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.warn('Video play error:', e));
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera access unavailable or permission denied. Please upload a photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the selfie horizontally to match preview
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setPreviewImage(dataUrl);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'live_selfie.jpg', { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.95);

        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      onCapture(file);
    }
  };

  const handleReset = () => {
    setPreviewImage(null);
    onCapture(null);
    stopCamera();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '2px dashed',
        borderColor: previewImage ? 'success.main' : 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
        borderRadius: 3,
        textAlign: 'center',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {previewImage ? (
        <Box sx={{ width: '100%' }}>
          <img
            src={previewImage}
            alt="Selfie Preview"
            style={{
              maxHeight: 160,
              borderRadius: 12,
              border: '2px solid #10B981',
              objectFit: 'cover',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
            <SuccessIcon sx={{ color: 'success.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Live Selfie Attached
            </Typography>
            <IconButton size="small" onClick={handleReset} sx={{ color: '#EF4444' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
          <Button size="small" startIcon={<RetakeIcon />} onClick={handleReset} sx={{ mt: 0.5, color: 'text.secondary' }}>
            Retake / Change Photo
          </Button>
        </Box>
      ) : isCameraActive ? (
        <Box sx={{ width: '100%', maxWidth: 360 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              borderRadius: 8,
              transform: 'scaleX(-1)', // mirror video
              backgroundColor: '#000',
            }}
          />
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Button variant="contained" color="success" onClick={capturePhoto} startIcon={<CameraIcon />}>
              Capture
            </Button>
            <Button variant="outlined" color="error" onClick={stopCamera}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            centered
            sx={{ mb: 2, '& .MuiTab-root': { fontSize: '0.8rem', fontWeight: 700 } }}
          >
            <Tab label="Webcam Capture" />
            <Tab label="Upload Selfie File" />
          </Tabs>

          {tabIndex === 0 && (
            <Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                  color: 'secondary.main',
                }}
              >
                <CameraIcon />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Live Face Biometric Capture
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Direct webcam capture for passive liveness & anti-spoofing
              </Typography>
              {cameraError && (
                <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mt: 1 }}>
                  {cameraError}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={startCamera}
                startIcon={<CameraIcon />}
                sx={{ mt: 2 }}
              >
                Open Webcam
              </Button>
            </Box>
          )}

          {tabIndex === 1 && (
            <Box component="label" sx={{ cursor: 'pointer', display: 'block' }}>
              <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                  color: 'primary.main',
                }}
              >
                <UploadIcon />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Upload Selfie Photo
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Select a clear front-facing portrait photo from your computer
              </Typography>
              <Button variant="outlined" color="primary" component="span" startIcon={<UploadIcon />} sx={{ mt: 2 }}>
                Select Photo
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};
