"""Offline-only matte. The source photo never leaves this machine."""
import os
import sys
from pathlib import Path

os.environ.setdefault("U2NET_HOME", str(Path(__file__).resolve().parents[1] / ".qa" / "models"))
from PIL import Image
from rembg import new_session, remove

source, mask_path, cutout_path = map(Path, sys.argv[1:4])
session = new_session("u2net_human_seg", providers=["CPUExecutionProvider"])
cutout = remove(Image.open(source).convert("RGB"), session=session, post_process_mask=True)
cutout.save(cutout_path)
cutout.getchannel("A").save(mask_path)
print("Offline human matte saved; original crop and subject retained.")
