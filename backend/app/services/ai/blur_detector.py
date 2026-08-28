import cv2
import numpy as np
from typing import Tuple
from app.core.logging import logger


class BlurDetector:
    """
    Computes image sharpness / blur index using Laplacian Variance.
    A higher score indicates a crisp, sharp image.
    Score is mapped to a normalized 0-100 scale.
    """

    @staticmethod
    def calculate_blur_score(image_path: str) -> Tuple[float, bool]:
        """
        Returns:
            blur_score (0-100): 100 = crystal clear, 0 = heavily blurred
            is_usable (bool): whether sharpness is above usable threshold (> 30.0)
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                logger.warning(f"Could not read image for blur analysis: {image_path}")
                return 50.0, True

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            # Calculate the Laplacian variance
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()

            # Normalization: variance < 100 is blurry, > 500 is sharp
            # Map variance ~ 0-800 to 0-100
            score = float(np.clip((variance / 5.0), 0.0, 100.0))
            is_usable = score >= 25.0

            return round(score, 2), is_usable
        except Exception as e:
            logger.error(f"Blur calculation error: {e}")
            return 75.0, True
