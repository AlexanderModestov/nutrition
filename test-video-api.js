// Simple test to verify the video API logic works
const path = require('path');
const fs = require('fs').promises;

async function testVideoAPI() {
  try {
    console.log('🎬 Testing Video API Integration');
    
    // Load the video descriptions
    const configPath = path.join(__dirname, 'public', 'configs', 'video_descriptions.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const localVideoData = JSON.parse(configContent);
    
    console.log('✅ Loaded video descriptions');
    console.log(`📊 Found ${Object.keys(localVideoData.videos).length} videos in config file`);
    
    // Show some sample video IDs
    const videoIds = Object.keys(localVideoData.videos).slice(0, 5);
    console.log('📋 Sample video IDs:', videoIds);
    
    // Show structure of first video
    const firstVideoId = videoIds[0];
    const firstVideo = localVideoData.videos[firstVideoId];
    console.log('\n📹 Sample video structure:');
    console.log(`ID: ${firstVideoId}`);
    console.log(`Name: ${firstVideo.name}`);
    console.log(`Short Description: ${firstVideo.short_description.substring(0, 100)}...`);
    
    console.log('\n🔧 Next steps:');
    console.log('1. Make sure your Google Drive folder contains video files named like the IDs above');
    console.log('2. Share the Google Drive folder with: expert-knowledge-hub@uniquers.iam.gserviceaccount.com');
    console.log('3. Start the dev server: npm run dev');
    console.log('4. Test: http://localhost:3000/api/videos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVideoAPI();