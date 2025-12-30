from PIL import Image
import io

def load_image(file_bytes: bytes) -> Image.Image:
    """
    Loads bytes into a PIL Image.
    """
    try:
        return Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Invalid image data: {e}")
