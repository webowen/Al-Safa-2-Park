import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const publicDir = path.join(root, 'public');
const targetDir = path.join(publicDir, 'cesium');

fs.mkdirSync(targetDir, { recursive: true });

const sourceDir = path.join(root, 'node_modules', 'cesium', 'Build', 'Cesium');
const assetDirectories = ['Assets', 'ThirdParty', 'Widgets', 'Workers'];

for (const directory of assetDirectories) {
  const source = path.join(sourceDir, directory);
  const dest = path.join(targetDir, directory);

  try {
    if (fs.existsSync(source)) {
      copyDirectory(source, dest);
    }
  } catch (error) {
    console.warn(`Warning: could not copy Cesium ${directory}:`, error.message);
  }
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}
