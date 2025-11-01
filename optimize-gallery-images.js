const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function optimizeGalleryImages() {
  const galleryPath = path.join(
    __dirname,
    "public",
    "assets",
    "images",
    "gallery"
  );

  if (!fs.existsSync(galleryPath)) {
    console.error(`Gallery folder not found: ${galleryPath}`);
    return;
  }

  const files = fs
    .readdirSync(galleryPath)
    .filter((file) => file.endsWith(".jpg"));

  console.log(`🖼️  Found ${files.length} JPG images to optimize\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of files) {
    const inputPath = path.join(galleryPath, file);
    const webpPath = path.join(galleryPath, file.replace(".jpg", ".webp"));

    try {
      const originalSize = fs.statSync(inputPath).size;
      totalOriginalSize += originalSize;

      // WebP 파일이 이미 있는지 확인
      if (fs.existsSync(webpPath)) {
        const webpSize = fs.statSync(webpPath).size;
        totalOptimizedSize += webpSize;
        const savings = (
          ((originalSize - webpSize) / originalSize) *
          100
        ).toFixed(2);
        console.log(
          `✅ ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(
            webpSize / 1024
          ).toFixed(2)}KB (${savings}% 감소)`
        );
      } else {
        // WebP 생성
        await sharp(inputPath)
          .webp({ quality: 80 }) // 품질 80으로 최적화
          .toFile(webpPath);

        const webpSize = fs.statSync(webpPath).size;
        totalOptimizedSize += webpSize;
        const savings = (
          ((originalSize - webpSize) / originalSize) *
          100
        ).toFixed(2);
        console.log(
          `🆕 ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(
            webpSize / 1024
          ).toFixed(2)}KB (${savings}% 감소)`
        );
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n📊 전체 통계:`);
  console.log(
    `   원본 JPG 총 크기: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `   WebP 총 크기: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `   총 절감: ${(
      ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) *
      100
    ).toFixed(2)}%`
  );
  console.log(
    `\n💡 WebP는 이미 생성되어 있으며, 브라우저가 자동으로 사용합니다.`
  );
}

optimizeGalleryImages();
