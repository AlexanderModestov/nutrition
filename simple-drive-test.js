const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function simpleDriveTest() {
  console.log('🚀 Simple Google Drive API Test\n');

  try {
    // Create auth client directly
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'uniquers', // Update this to your actual project ID
        private_key_id: 'dummy',
        private_key: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
        client_id: 'dummy',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    console.log('🔐 Getting auth client...');
    const authClient = await auth.getClient();
    console.log('✅ Auth client obtained');

    console.log('🗂️ Creating Drive client...');
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log('✅ Drive client created');

    console.log('📊 Testing Drive API with minimal call...');
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id,name)'
    });

    console.log('🎉 SUCCESS! Drive API is working!');
    console.log(`Found ${response.data.files?.length || 0} accessible files`);
    
    if (response.data.files && response.data.files.length > 0) {
      console.log('Sample file:', response.data.files[0]);
    } else {
      console.log('\n💡 No files found. This might mean:');
      console.log('   • Service account has no shared files');
      console.log('   • Need to share Google Drive folders with:');
      console.log(`     ${process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL}`);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.message.includes('Login Required')) {
      console.log('\n🔧 This usually means:');
      console.log('   • Google Drive API is not enabled in your project');
      console.log('   • Or the service account lacks proper permissions');
      console.log('\n📋 To fix:');
      console.log('   1. Go to: https://console.cloud.google.com/apis/library');
      console.log('   2. Search for "Google Drive API"');
      console.log('   3. Make sure it shows "API Enabled"');
      console.log('   4. If not, click "Enable"');
    }
  }
}

simpleDriveTest();