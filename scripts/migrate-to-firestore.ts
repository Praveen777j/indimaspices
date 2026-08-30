import fs from 'fs';
import path from 'path';
import { getFirebaseAdmin } from '../server/firebaseAdmin';

interface DbData {
  products?: any[];
  categories?: any[];
  orders?: any[];
  customers?: any[];
  recipes?: any[];
  banners?: any[];
  offers?: any[];
  reviews?: any[];
  settings?: any;
  auditLogs?: any[];
  leads?: any[];
}

async function runMigration() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute') || args.includes('--real') || args.includes('--apply');
  const isDryRun = !isExecute || args.includes('--dry-run');

  console.log('================================================================');
  console.log(' INDIMA SPICE CO. - FIRESTORE DATA MIGRATION UTILITY');
  console.log('================================================================');
  console.log(` Mode: ${isExecute ? '🚀 REAL EXECUTION (Writing to Firestore)' : '🔍 DRY RUN (Preview only, no writes)'}`);
  console.log('----------------------------------------------------------------');

  const dbFilePath = path.join(process.cwd(), 'data', 'db.json');
  if (!fs.existsSync(dbFilePath)) {
    console.error(`❌ Error: Source database file not found at ${dbFilePath}`);
    process.exit(1);
  }

  let dbData: DbData = {};
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    dbData = JSON.parse(raw);
  } catch (err: any) {
    console.error(`❌ Error reading/parsing ${dbFilePath}:`, err.message);
    process.exit(1);
  }

  const adminConfig = getFirebaseAdmin();
  const firestore = adminConfig.firestore;
  const projectId = adminConfig.projectId;
  const firestoreDbId = adminConfig.databaseId;

  console.log(` Target Project ID: ${projectId}`);
  console.log(` Target Firestore DB: ${firestoreDbId}`);
  console.log(` Auth Source: ${adminConfig.source}`);
  console.log('----------------------------------------------------------------');

  // Analyze dataset in db.json
  const collectionsToMigrate: { name: string; items: any[]; getId: (item: any) => string }[] = [
    { name: 'products', items: dbData.products || [], getId: item => item.id },
    { name: 'categories', items: dbData.categories || [], getId: item => item.id },
    { name: 'orders', items: dbData.orders || [], getId: item => item.id },
    { name: 'customers', items: dbData.customers || [], getId: item => item.id },
    { name: 'recipes', items: dbData.recipes || [], getId: item => item.id },
    { name: 'banners', items: dbData.banners || [], getId: item => item.id },
    { name: 'offers', items: dbData.offers || [], getId: item => item.id },
    { name: 'reviews', items: dbData.reviews || [], getId: item => item.id },
    { name: 'leads', items: dbData.leads || [], getId: item => item.id },
    { name: 'audit_logs', items: dbData.auditLogs || [], getId: item => item.id }
  ];

  console.log('\n📊 COLLECTION ANALYSIS:');
  console.log('----------------------------------------------------------------');

  let totalItemsInSource = 0;
  let totalToCreate = 0;
  let totalExisting = 0;
  let totalErrors = 0;

  for (const col of collectionsToMigrate) {
    let existingIds = new Set<string>();
    let fetchError: string | null = null;

    try {
      const snap = await firestore.collection(col.name).get();
      snap.forEach(doc => existingIds.add(doc.id));
    } catch (e: any) {
      fetchError = e.message || 'Connection error';
      totalErrors++;
    }

    let toCreateCount = 0;
    let existingCount = 0;

    for (const item of col.items) {
      const id = col.getId(item);
      if (id && existingIds.has(String(id))) {
        existingCount++;
      } else {
        toCreateCount++;
      }
    }

    totalItemsInSource += col.items.length;
    totalToCreate += toCreateCount;
    totalExisting += existingCount;

    const statusNote = fetchError 
      ? `[Firestore read error: ${fetchError}]`
      : `To Create: ${String(toCreateCount).padStart(3)} | Existing/Overlap: ${String(existingCount).padStart(3)}`;

    console.log(` • Collection: [${col.name.padEnd(12)}] Source: ${String(col.items.length).padStart(4)} | ${statusNote}`);
  }

  // Check Settings
  const hasSettings = Boolean(dbData.settings && Object.keys(dbData.settings).length > 0);
  let settingsExisting = false;
  try {
    const setSnap = await firestore.collection('settings').doc('store_settings').get();
    settingsExisting = setSnap.exists;
  } catch (_) {}

  if (hasSettings) {
    totalItemsInSource += 1;
    if (settingsExisting) {
      totalExisting += 1;
    } else {
      totalToCreate += 1;
    }
  }

  console.log(` • Collection: [settings    ] Source: ${hasSettings ? '   1' : '   0'} | To Create: ${hasSettings && !settingsExisting ? '  1' : '  0'} | Existing/Overlap: ${settingsExisting ? '  1' : '  0'}`);

  console.log('----------------------------------------------------------------');
  console.log(` 📋 Summary Statistics:`);
  console.log(`   - Total Source Records in data/db.json : ${totalItemsInSource}`);
  console.log(`   - Documents to Create/Add in Firestore : ${totalToCreate}`);
  console.log(`   - Documents with Existing ID / Overlap : ${totalExisting}`);
  console.log(`   - Query Errors Encountered             : ${totalErrors}`);
  console.log('================================================================');

  if (isDryRun && !isExecute) {
    console.log('\n✅ DRY RUN COMPLETED SUCCESSFULLY!');
    console.log('No documents were written to Firestore.');
    console.log('\nTo execute the actual migration and write to Firestore, run:');
    console.log('  npx tsx scripts/migrate-to-firestore.ts --execute');
    console.log('  or: npm run migrate:firestore -- --execute\n');
    process.exit(0);
  }

  // Execute migration
  console.log('\n⚡ EXECUTING MIGRATION WRITES TO FIRESTORE...\n');
  let migratedCount = 0;

  for (const col of collectionsToMigrate) {
    if (col.items.length === 0) continue;
    console.log(` ⏳ Migrating collection: ${col.name} (${col.items.length} items)...`);

    // Batch in chunks of 400 (Firestore limit is 500)
    const chunkSize = 400;
    for (let i = 0; i < col.items.length; i += chunkSize) {
      const chunk = col.items.slice(i, i + chunkSize);
      const batch = firestore.batch();

      for (const item of chunk) {
        const id = col.getId(item);
        if (!id) continue;
        const clean = JSON.parse(JSON.stringify(item));
        const docRef = firestore.collection(col.name).doc(String(id));
        batch.set(docRef, clean, { merge: true });
        migratedCount++;
      }

      await batch.commit();
    }
    console.log(`   ✅ Successfully written ${col.items.length} documents to '${col.name}'`);
  }

  // Write settings
  if (hasSettings) {
    console.log(' ⏳ Migrating store settings...');
    const cleanSettings = JSON.parse(JSON.stringify(dbData.settings));
    await firestore.collection('settings').doc('store_settings').set(cleanSettings, { merge: true });
    migratedCount++;
    console.log('   ✅ Successfully written store settings to \'settings/store_settings\'');
  }

  // Write migration metadata / permanent marker
  const migrationMeta = {
    migration_name: 'Indima Spice Co. One-Time Firestore Migration',
    completedAt: new Date().toISOString(),
    source: 'data/db.json',
    target_project: projectId,
    target_database: firestoreDbId,
    total_documents: migratedCount,
    status: 'COMPLETED'
  };
  await firestore.collection('system').doc('migration_status').set(migrationMeta, { merge: true });
  await firestore.collection('settings').doc('migration_meta').set(migrationMeta, { merge: true });

  console.log('\n================================================================');
  console.log('FIRESTORE MIGRATION COMPLETED SUCCESSFULLY');
  console.log(`Total documents imported: ${migratedCount}`);
  console.log(`Permanent marker locked in 'system/migration_status'`);
  console.log('================================================================\n');
}

runMigration().catch(err => {
  console.error('\n❌ Fatal migration error:', err.message || err);
  if (String(err).includes('NOT_FOUND') || String(err).includes('UNAUTHENTICATED') || String(err).includes('PERMISSION_DENIED')) {
    console.error('\n💡 Authentication Guidance:');
    console.error('To connect to Firebase Cloud Firestore for project "indimaspicea":');
    console.error('1. Go to Firebase Console -> Project Settings -> Service Accounts -> "Generate new private key"');
    console.error('2. Pass the JSON content via the FIREBASE_SERVICE_ACCOUNT environment variable:');
    console.error('   FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account",...}\' npm run migrate:firestore -- --execute');
  }
  process.exit(1);
});
