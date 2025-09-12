const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testGoogleDriveCredentials() {
  console.log('🔍 Testing Google Drive credentials...\n');

  // Check if environment variables are set
  const serviceAccountEmail = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY;
  const videoFolderId = process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;

  console.log('📋 Environment Variables:');
  console.log(`✓ Service Account Email: ${serviceAccountEmail ? 'Set' : '❌ Missing'}`);
  console.log(`✓ Service Account Key: ${serviceAccountKey ? 'Set (' + serviceAccountKey.length + ' chars)' : '❌ Missing'}`);
  console.log(`✓ Video Folder ID: ${videoFolderId || 'Not set (optional)'}\n`);

  if (!serviceAccountEmail || !serviceAccountKey) {
    console.log('❌ Missing required credentials. Please check your .env.local file.');
    return;
  }

  try {
    // Initialize authentication
    console.log('🔐 Initializing authentication...');
    const auth = new JWT({
      email: serviceAccountEmail,
      key: serviceAccountKey.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    // Test the auth token first
    console.log('🔗 Getting access token...');
    const { token } = await auth.getAccessToken();
    console.log('✅ Access token obtained');

    const drive = google.drive({ version: 'v3', auth });

    // Test 1: Basic authentication
    console.log('🔑 Testing authentication...');
    await auth.authorize();
    console.log('✅ Authentication successful!\n');

    // Test 1.5: Check service account info
    console.log('👤 Checking service account details...');
    try {
      const iam = google.iam({ version: 'v1', auth });
      const serviceAccountInfo = await iam.projects.serviceAccounts.get({
        name: `projects/${auth.projectId || 'theta-bindery-460409-r5'}/serviceAccounts/${serviceAccountEmail}`
      });
      console.log(`✅ Service account found: ${serviceAccountInfo.data.displayName || 'No display name'}`);
    } catch (error) {
      console.log(`⚠️  Could not verify service account: ${error.message}`);
    }

    // Test 2: Try a simple API call first (about)
    console.log('📊 Testing basic Drive API access...');
    try {
      const aboutResponse = await drive.about.get({ fields: 'user,storageQuota' });
      console.log(`✅ Drive API accessible!`);
      if (aboutResponse.data.user) {
        console.log(`   User: ${aboutResponse.data.user.emailAddress || 'Service Account'}`);
      }
    } catch (error) {
      console.log(`❌ Drive API access failed: ${error.message}`);
      
      // Try without the 'user' field for service accounts
      console.log('🔄 Trying alternate API call...');
      try {
        const simpleResponse = await drive.about.get({ fields: 'kind' });
        console.log(`✅ Basic Drive API access confirmed!`);
      } catch (secondError) {
        console.log(`❌ Alternate API call also failed: ${secondError.message}`);
        throw error;
      }
    }

    // Test 3: List files accessible to service account
    console.log('📁 Testing accessible files (no folder restriction)...');
    const response = await drive.files.list({
      fields: 'files(id,name,mimeType,size,modifiedTime,parents)',
      pageSize: 10,
    });

    const files = response.data.files || [];
    console.log(`✅ Found ${files.length} files\n`);

    if (files.length > 0) {
      console.log('📄 Sample files:');
      files.slice(0, 5).forEach((file, index) => {
        console.log(`${index + 1}. ${file.name} (${file.mimeType})`);
      });
      console.log('');
    }

    // Test 3: Check video files specifically
    console.log('🎥 Testing video file access...');
    const videoQuery = videoFolderId 
      ? `'${videoFolderId}' in parents and (mimeType='video/mp4' or mimeType='video/avi' or mimeType='video/mov')`
      : "(mimeType='video/mp4' or mimeType='video/avi' or mimeType='video/mov')";

    const videoResponse = await drive.files.list({
      q: videoQuery,
      fields: 'files(id,name,mimeType,size)',
      pageSize: 5,
    });

    const videoFiles = videoResponse.data.files || [];
    console.log(`✅ Found ${videoFiles.length} video files\n`);

    if (videoFiles.length > 0) {
      console.log('🎬 Video files:');
      videoFiles.forEach((file, index) => {
        const sizeInMB = file.size ? Math.round(parseInt(file.size) / 1024 / 1024) : 'Unknown';
        console.log(`${index + 1}. ${file.name} (${sizeInMB} MB)`);
      });
    } else {
      console.log('⚠️  No video files found. Make sure:');
      console.log('   - Video files are uploaded to Google Drive');
      console.log('   - Folder is shared with service account');
      console.log('   - Files are in supported formats (MP4, AVI, MOV)');
    }

    console.log('\n🎉 Google Drive integration test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure your folders are shared with the service account');
    console.log('   2. Run: npm run dev');
    console.log('   3. Visit your app to see materials from Google Drive');

  } catch (error) {
    console.log('❌ Error testing Google Drive credentials:');
    console.log('Error details:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 Possible fixes:');
      console.log('   - Check that the private key is correctly formatted in .env.local');
      console.log('   - Ensure the service account exists and is active');
      console.log('   - Verify the service account email is correct');
    } else if (error.message.includes('insufficient authentication scopes')) {
      console.log('\n🔧 Possible fixes:');
      console.log('   - The service account needs Google Drive API access');
      console.log('   - Check that Google Drive API is enabled in your project');
    } else if (error.message.includes('Forbidden')) {
      console.log('\n🔧 Possible fixes:');
      console.log('   - Share your Google Drive folders with the service account email');
      console.log('   - Grant "Viewer" permission to the service account');
    }
  }
}

// Run the test
testGoogleDriveCredentials();