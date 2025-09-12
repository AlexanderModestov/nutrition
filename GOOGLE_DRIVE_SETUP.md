# Google Drive Integration Setup

This application can fetch materials (videos, texts, and URLs) directly from Google Drive instead of using local files.

## Prerequisites

1. A Google Cloud Project
2. Google Drive API enabled
3. A Service Account with appropriate permissions
4. Access to the Google Drive folders containing your materials

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 2. Enable Google Drive API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### 3. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `expert-knowledge-hub-drive`
   - Description: `Service account for accessing Google Drive materials`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 4. Generate Service Account Key

1. In the "Credentials" page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Choose "JSON" format and click "Create"
6. A JSON file will be downloaded - keep it secure!

### 5. Share Google Drive Folders

1. Open Google Drive and navigate to the folders containing your materials
2. Right-click on each folder and select "Share"
3. Add the service account email (from step 3) as a viewer
4. The service account email looks like: `expert-knowledge-hub-drive@your-project-id.iam.gserviceaccount.com`

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Open the JSON key file you downloaded in step 4
3. Fill in the environment variables:

```bash
# From the JSON file
GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Optional: Specify specific folder IDs
GOOGLE_DRIVE_VIDEO_FOLDER_ID=1ABC123XYZ456
GOOGLE_DRIVE_TEXT_FOLDER_ID=1DEF789UVW123
GOOGLE_DRIVE_URL_FOLDER_ID=1GHI456RST789
```

### 7. Get Folder IDs (Optional)

If you want to limit the search to specific folders:

1. Open the folder in Google Drive
2. Look at the URL: `https://drive.google.com/drive/folders/1ABC123XYZ456`
3. The folder ID is the part after `/folders/`: `1ABC123XYZ456`

## Supported File Types

### Videos
- MP4, AVI, MOV, WMV, FLV, WebM

### Texts
- Plain text files (.txt)
- Google Docs
- Markdown files (.md)
- HTML files (.html)

### URLs
- Google Sheets containing URL collections
- Any spreadsheet file will be treated as a URL resource

## Troubleshooting

### Authentication Issues
- Ensure the service account email has been shared with your Drive folders
- Check that the private key in the environment variable is properly formatted
- Verify that the Google Drive API is enabled in your project

### No Files Found
- Check that the folder IDs are correct
- Ensure the service account has access to the folders
- Verify that the folders contain files of supported types

### API Quota Exceeded
- Google Drive API has usage limits
- Consider implementing caching if you have many requests
- Check your quota usage in the Google Cloud Console

## Security Notes

- Never commit your `.env.local` file or service account keys to version control
- Keep your service account JSON file secure
- Regularly rotate your service account keys for enhanced security
- Only grant minimum necessary permissions to the service account