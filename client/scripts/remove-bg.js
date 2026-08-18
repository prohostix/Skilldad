import * as JimpModule from 'jimp';
// jimp package might expose Jimp as Jimp or default. Let's try importing it like this.
const Jimp = JimpModule.default || JimpModule;

async function removeBg() {
    try {
        const image = await Jimp.read('../public/student_hero_illustration.png');
        
        const bgColor = image.getPixelColor(0, 0);
        const rgba = Jimp.intToRGBA(bgColor);
        console.log('Background color is:', rgba);

        const targetColor = { r: rgba.r, g: rgba.g, b: rgba.b };
        const threshold = 30;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            const diff = Math.abs(r - targetColor.r) + Math.abs(g - targetColor.g) + Math.abs(b - targetColor.b);
            
            if (diff < threshold) {
                this.bitmap.data[idx + 3] = 0;
            }
        });

        await image.writeAsync('../public/student_hero_transparent.png');
        console.log('Successfully created student_hero_transparent.png');
    } catch (err) {
        console.error(err);
    }
}

removeBg();
