const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const videosDir = path.join(__dirname, "../public/videos");
const thumbnailsDir = path.join(__dirname, "../public/videos");

// Ensure thumbnails directory exists
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Generate thumbnails for each video
const videos = ["video1.mov", "video2.mov", "video3.mov", "video4.mov"];

videos.forEach((video) => {
  const videoPath = path.join(videosDir, video);
  const thumbnailPath = path.join(
    thumbnailsDir,
    video.replace(".mov", "-thumb.jpg")
  );

  // Check if video exists
  if (!fs.existsSync(videoPath)) {
    console.log(`Video not found: ${video}`);
    return;
  }

  // Generate thumbnail at 5 seconds into the video
  const command = `ffmpeg -i "${videoPath}" -ss 00:00:05 -vframes 1 -q:v 2 "${thumbnailPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating thumbnail for ${video}:`, error);
      return;
    }
    console.log(`✅ Generated thumbnail for ${video}`);
  });
});

console.log("🎬 Starting thumbnail generation...");
console.log("📁 Videos directory:", videosDir);
console.log("🖼️  Thumbnails will be saved to:", thumbnailsDir);
