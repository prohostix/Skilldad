import sys
from PIL import Image
import numpy as np

courses_path = '/var/www/skilldad/server/uploads/file-1789534423420.png'
img = Image.open(courses_path)
arr = np.array(img)
print('Courses shape:', arr.shape, 'dtype:', arr.dtype)
alpha = arr[:, :, 3]
print('Alpha unique values count:', len(np.unique(alpha)))
print('Alpha > 0 count:', (alpha > 0).sum())
print('Alpha == 255 count:', (alpha == 255).sum())
print('Alpha between 1 and 254 count:', ((alpha > 0) & (alpha < 255)).sum())

# Sample pixels where alpha > 0
sample_fg = arr[alpha > 200]
print('Sample FG RGB mean:', sample_fg[:, :3].mean(axis=0))
print('Sample FG RGB min:', sample_fg[:, :3].min(axis=0))
print('Sample FG RGB max:', sample_fg[:, :3].max(axis=0))
