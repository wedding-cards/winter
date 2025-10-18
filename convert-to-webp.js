const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToWebP() {
  const inputPath = path.join(__dirname, 'public', 'assets', 'images', 'couple-main.jpg');
  const outputPath = path.join(__dirname, 'public', 'assets', 'images', 'couple-main.webp');
  const buildOutputPath = path.join(__dirname, 'build', 'assets', 'images', 'couple-main.webp');

  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      return;
    }

    // Convert to WebP for public folder
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✅ WebP image created successfully: ${outputPath}`);
    
    // Get file sizes
    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
    
    console.log(`📊 Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`📊 WebP size: ${(webpSize / 1024).toFixed(2)} KB`);
    console.log(`💰 Size reduction: ${savings}%`);

    // Also copy to build folder if it exists
    if (fs.existsSync(path.join(__dirname, 'build', 'assets', 'images'))) {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(buildOutputPath);
      console.log(`✅ WebP image also created in build folder: ${buildOutputPath}`);
    }
  } catch (error) {
    console.error('❌ Error converting image:', error);
  }
}

convertToWebP();
