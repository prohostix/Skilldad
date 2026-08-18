from PIL import Image
import os

img_path = "client/public/student_hero_illustration.png"
out_path = "client/public/student_hero_illustration_transparent.png"

img = Image.open(img_path).convert("RGBA")
datas = img.getdata()

# The top-left pixel is the background color
bg_color = datas[0]
r_bg, g_bg, b_bg = bg_color[:3]
threshold = 30

newData = []
for item in datas:
    r, g, b, a = item
    if abs(r - r_bg) + abs(g - g_bg) + abs(b - b_bg) < threshold:
        newData.append((255, 255, 255, 0)) # Transparent
    else:
        newData.append(item)

img.putdata(newData)
img.save(out_path, "PNG")
print("Saved transparent image to", out_path)
