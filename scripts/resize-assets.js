const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const iconInput = path.join(assetsDir, 'icon.png');
const splashInput = path.join(assetsDir, 'splash-icon.png');

const outputs = {
  icon1024: path.join(assetsDir, 'icon-1024.png'),
  adaptiveForeground: path.join(assetsDir, 'adaptive-icon.png'),
  splash1242: path.join(assetsDir, 'splash-1242x2436.png'),
  splash1080: path.join(assetsDir, 'splash-1080x1920.png'),
};

const ensureFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing input file: ${filePath}`);
  }
};

const resizeIcon = async () => {
  await sharp(iconInput)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(outputs.icon1024);

  await sharp(iconInput)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputs.adaptiveForeground);
};

const resizeSplash = async () => {
  await sharp(splashInput)
    .resize(1242, 2436, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(outputs.splash1242);

  await sharp(splashInput)
    .resize(1080, 1920, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(outputs.splash1080);
};

const run = async () => {
  ensureFile(iconInput);
  ensureFile(splashInput);

  await resizeIcon();
  await resizeSplash();

  console.log('Generated assets:');
  console.log(outputs.icon1024);
  console.log(outputs.adaptiveForeground);
  console.log(outputs.splash1242);
  console.log(outputs.splash1080);
};

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
