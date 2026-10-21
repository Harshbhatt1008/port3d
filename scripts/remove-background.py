"""Offline-only matte. The source photo never leaves this machine."""
import os
import sys
from pathlib import Path

os.environ.setdefault("U2NET_HOME", str(Path(__file__).resolve().parents[1] / ".qa" / "models"))
from PIL import Image
from rembg import new_session, remove

source, mask_path, cutout_path = map(Path, sys.argv[1:4])
session = new_session("u2net_human_seg", providers=["CPUExecutionProvider"])
cutout = remove(
    Image.open(source).convert("RGB"), session=session,
    alpha_matting=True,
    alpha_matting_foreground_threshold=240,
    alpha_matting_background_threshold=12,
    alpha_matting_erode_size=3,
    post_process_mask=False,
)
cutout.save(cutout_path)
cutout.getchannel("A").save(mask_path)
print("Offline alpha matte saved; fine hair, glasses and beard edges retained.")
