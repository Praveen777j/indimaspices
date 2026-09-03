import fs from 'fs';
import path from 'path';
import { getFirebaseAdmin } from '../server/firebaseAdmin';
import {
  initCloudinary,
  getCloudinaryStatus,
  migrateLocalMediaToCloudinary
} from '../server/cloudinary';

async function runMediaMigration() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute') || args.includes('--real') || args.includes('--apply');
  const isDryRun = !isExecute || args.includes('--dry-run');

  console.log('================================================================');
  console.log(' INDIMA SPICE CO. - CLOUDINARY MEDIA MIGRATION UTILITY');
  console.log('================================================================');
  console.log(` Mode: ${isExecute ? '🚀 REAL EXECUTION (Uploading to Cloudinary & Updating Firestore)' : '🔍 DRY RUN (Preview only, no uploads or database writes)'}`);
  console.log('----------------------------------------------------------------');

  const status = getCloudinaryStatus();
  console.log(` Cloudinary Cloud Name: ${status.cloudName || '(Not configured)'}`);
  console.log(` Credentials Source: ${status.source}`);
  console.log(` Video Upload Support: ${status.supportsVideo ? 'Enabled' : 'Disabled'}`);
  console.log('----------------------------------------------------------------');

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 public/uploads directory does not exist or is empty.');
    process.exit(0);
  }

  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  console.log(` Found ${files.length} file(s) in public/uploads/:`);
  for (const f of files.slice(0, 20)) {
    const ext = path.extname(f).toLowerCase();
    const isVid = ['.mp4', '.webm', '.mov', '.mkv', '.avi'].includes(ext);
    console.log(`   - ${f} (${isVid ? 'VIDEO' : 'IMAGE'})`);
  }
  if (files.length > 20) {
    console.log(`   ... and ${files.length - 20} more files`);
  }
  console.log('----------------------------------------------------------------');

  if (isDryRun) {
    console.log('💡 This was a DRY RUN.');
    console.log('To execute the real upload to Cloudinary and update Firestore records, run:');
    console.log('   npm run migrate:media -- --execute');
    process.exit(0);
  }

  if (!status.configured) {
    console.error('❌ Error: Cloudinary credentials are not configured in environment variables.');
    console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment or Render dashboard.');
    process.exit(1);
  }

  initCloudinary();

  console.log('Connecting to Firestore to scan for references...');
  const admin = getFirebaseAdmin();
  const fsDb = admin.firestore;

  console.log('Starting migration to Cloudinary...');
  try {
    const result = await migrateLocalMediaToCloudinary(fsDb);
    console.log('================================================================');
    console.log(' MIGRATION COMPLETED SUCCESSFULLY');
    console.log('================================================================');
    console.log(` Files Uploaded to Cloudinary: ${result.uploadedCount}`);
    console.log(` Firestore Documents Updated: ${result.updatedDocsCount}`);
    if (result.errors.length > 0) {
      console.warn(` ⚠️ Warnings/Errors (${result.errors.length}):`);
      for (const err of result.errors) {
        console.warn(`   - ${err}`);
      }
    }
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMediaMigration().catch(err => {
  console.error('Fatal error in media migration:', err);
  process.exit(1);
});
