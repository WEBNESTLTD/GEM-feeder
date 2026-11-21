import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy needed production files
const itemsToCopy = ['index.html', 'src', 'assets', 'design', 'vendor'];
for (const item of itemsToCopy) {
  if (fs.existsSync(item)) {
    copyRecursive(path.resolve(item), path.join(distDir, item));
    console.log(`Copied ${item} to dist/`);
  }
}

console.log('Production build successfully created in dist/');
