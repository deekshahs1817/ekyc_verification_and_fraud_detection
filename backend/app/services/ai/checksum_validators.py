import re
from typing import Tuple


class ChecksumValidators:
    """
    Standard Indian ID Verification Algorithms:
    1. Verhoeff Checksum for Aadhaar (12 digits)
    2. Format & Check Character for PAN (10 characters)
    """

    # Verhoeff algorithm multiplication table
    d_table = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ]

    # Verhoeff permutation table
    p_table = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ]

    # Verhoeff inverse table
    inv_table = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

    @classmethod
    def validate_aadhaar(cls, aadhaar_str: str) -> Tuple[bool, str]:
        """
        Validates Aadhaar number using length, digit checks and Verhoeff algorithm.
        """
        if not aadhaar_str:
            return False, "Aadhaar number is empty"

        cleaned = re.sub(r'[\s\-]', '', str(aadhaar_str).strip())
        if not re.match(r'^\d{12}$', cleaned):
            return False, f"Aadhaar must be 12 digits (received {len(cleaned)} chars)"

        # Apply Verhoeff checksum
        c = 0
        reversed_digits = [int(x) for x in reversed(cleaned)]
        for i, digit in enumerate(reversed_digits):
            c = cls.d_table[c][cls.p_table[i % 8][digit]]

        is_valid = (c == 0)
        return is_valid, "Valid Aadhaar Verhoeff Checksum" if is_valid else "Invalid Aadhaar Checksum (Verhoeff check failed)"

    @classmethod
    def validate_pan(cls, pan_str: str) -> Tuple[bool, str]:
        """
        Validates PAN structure:
        - 5 alphabetic chars (First 3: sequence, 4th: status e.g. P for Person, 5th: surname letter)
        - 4 numeric digits (0001 to 9999)
        - 1 check alphabet char
        """
        if not pan_str:
            return False, "PAN number is empty"

        cleaned = str(pan_str).strip().upper()
        pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'

        if not re.match(pan_pattern, cleaned):
            return False, f"Invalid PAN format '{cleaned}'. Must follow pattern: 5 letters, 4 digits, 1 letter."

        # 4th character validation for individuals / entities
        valid_entity_chars = ['P', 'C', 'H', 'A', 'B', 'G', 'J', 'L', 'F', 'T']
        if cleaned[3] not in valid_entity_chars:
            return False, f"Invalid PAN entity code '{cleaned[3]}'. Expected one of {valid_entity_chars}"

        return True, "Valid PAN structure"
