import logging
import sys
from rich.logging import RichHandler


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(rich_tracebacks=True, show_time=True)]
    )
    logger = logging.getLogger("ekyc")
    logger.setLevel(logging.INFO)
    return logger


logger = setup_logging()
