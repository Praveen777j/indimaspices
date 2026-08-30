import fs from 'fs';
import path from 'path';
import { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './firebaseAdmin';

interface MigrationResult {
  executed: boolean;
  success: boolean;
  totalImported: number;
  message: string;
}

export function getFirebaseAdminFirestore(): { firestore: AdminFirestore; projectId: string; firestoreDbId: string } | null {
  try {
    const adminConfig = getFirebaseAdmin();
    return {
      firestore: adminConfig.firestore,
      projectId: adminConfig.projectId,
      firestoreDbId: adminConfig.databaseId
    };
  } catch (err: any) {
    console.error('[Firebase Admin] Error getting Firestore client for migration:', err.message || err);
    return null;
  }
}

/**
 * Runs a safe, one-time migration from data/db.json into Cloud Firestore.
 * 
 * Safety Rules:
 * 1. ONLY executes when process.env.RUN_FIRESTORE_MIGRATION === 'true'.
 * 2. Checks system/migration_status. If already COMPLETED, skips completely.
 * 3. Does NOT delete or modify data/db.json or data/db.backup.json.
 * 4. Merges documents idempotently using document IDs.
 */
export async function runOneTimeFirestoreMigration(): Promise<MigrationResult> {
  const isEnabled = process.env.RUN_FIRESTORE_MIGRATION === 'true';

  if (!isEnabled) {
    return {
      executed: false,
      success: true,
      totalImported: 0,
      message: 'RUN_FIRESTORE_MIGRATION is not true. Migration skipped.'
    };
  }

  console.log('\n================================================================');
  console.log(' INDIMA SPICE CO. - ONE-TIME FIRESTORE MIGRATION SERVICE');
  console.log('================================================================');
  console.log(' Trigger: RUN_FIRESTORE_MIGRATION=true detected');

  const fb = getFirebaseAdminFirestore();
  if (!fb) {
    console.error('❌ Failed to initialize Firebase Admin Firestore for migration.');
    return {
      executed: true,
      success: false,
      totalImported: 0,
      message: 'Firebase Admin initialization failed.'
    };
  }

  const { firestore, projectId, firestoreDbId } = fb;
  console.log(` Target Firebase Project : ${projectId}`);
  console.log(` Target Firestore Database: ${firestoreDbId}`);
  console.log('----------------------------------------------------------------');

  // Check permanent migration marker in Firestore
  const markerDocRef = firestore.collection('system').doc('migration_status');
  try {
    const markerSnap = await markerDocRef.get();
    if (markerSnap.exists) {
      const markerData = markerSnap.data();
      if (markerData?.status === 'COMPLETED') {
        console.log(`\n🛡️ SAFETY LOCK ACTIVE: Migration already completed previously on: ${markerData.completedAt}`);
        console.log(`   Marker: system/migration_status (status: COMPLETED)`);
        console.log('   Skipping migration to prevent redundant writes or overwrites.');
        console.log('================================================================\n');
        return {
          executed: false,
          success: true,
          totalImported: markerData.total_documents || 0,
          message: 'Migration was already completed previously.'
        };
      }
    }
  } catch (markerErr: any) {
    console.warn(`[Migration Marker Check]: Could not verify system/migration_status: ${markerErr.message}`);
  }

  const dbFilePath = path.join(process.cwd(), 'data', 'db.json');
  if (!fs.existsSync(dbFilePath)) {
    console.error(`❌ Source dataset not found at ${dbFilePath}`);
    return {
      executed: true,
      success: false,
      totalImported: 0,
      message: `Source file ${dbFilePath} not found.`
    };
  }

  let dbData: any = {};
  try {
    const fileContent = fs.readFileSync(dbFilePath, 'utf-8');
    dbData = JSON.parse(fileContent);
  } catch (readErr: any) {
    console.error(`❌ Error reading source ${dbFilePath}:`, readErr.message);
    return {
      executed: true,
      success: false,
      totalImported: 0,
      message: `Failed reading ${dbFilePath}: ${readErr.message}`
    };
  }

  // Define collection mapping from data/db.json
  const collectionsToMigrate: {
    collectionName: string;
    items: any[];
    getId: (item: any) => string;
  }[] = [
    { collectionName: 'products', items: Array.isArray(dbData.products) ? dbData.products : [], getId: i => i.id },
    { collectionName: 'categories', items: Array.isArray(dbData.categories) ? dbData.categories : [], getId: i => i.id },
    { collectionName: 'orders', items: Array.isArray(dbData.orders) ? dbData.orders : [], getId: i => i.id },
    { collectionName: 'customers', items: Array.isArray(dbData.customers) ? dbData.customers : [], getId: i => i.id },
    { collectionName: 'recipes', items: Array.isArray(dbData.recipes) ? dbData.recipes : [], getId: i => i.id },
    { collectionName: 'banners', items: Array.isArray(dbData.banners) ? dbData.banners : [], getId: i => i.id },
    { collectionName: 'offers', items: Array.isArray(dbData.offers) ? dbData.offers : [], getId: i => i.id },
    { collectionName: 'reviews', items: Array.isArray(dbData.reviews) ? dbData.reviews : [], getId: i => i.id },
    { collectionName: 'leads', items: Array.isArray(dbData.leads) ? dbData.leads : [], getId: i => i.id },
    { collectionName: 'audit_logs', items: Array.isArray(dbData.auditLogs) ? dbData.auditLogs : (Array.isArray(dbData.audit_logs) ? dbData.audit_logs : []), getId: i => i.id }
  ];

  // Dynamic discovery of any other array properties in db.json not explicitly listed
  const knownKeys = new Set(['products', 'categories', 'orders', 'customers', 'recipes', 'banners', 'offers', 'reviews', 'leads', 'auditLogs', 'audit_logs', 'settings']);
  for (const [key, value] of Object.entries(dbData)) {
    if (!knownKeys.has(key) && Array.isArray(value) && value.length > 0) {
      collectionsToMigrate.push({
        collectionName: key,
        items: value,
        getId: i => (i.id ? String(i.id) : '')
      });
    }
  }

  console.log('\n📊 PRE-MIGRATION INSPECTION & AUDIT:');
  console.log('----------------------------------------------------------------');

  const preflightReports: {
    collection: string;
    sourceCount: number;
    existingCount: number;
    toCreateCount: number;
    conflictCount: number;
    errorCount: number;
  }[] = [];

  let overallSourceCount = 0;
  let overallToCreate = 0;
  let overallConflicts = 0;
  let hasPreflightErrors = false;

  for (const col of collectionsToMigrate) {
    let existingIds = new Set<string>();
    let colErrors = 0;

    try {
      const snap = await firestore.collection(col.collectionName).get();
      snap.forEach(d => existingIds.add(d.id));
    } catch (e: any) {
      console.error(` ⚠️ Pre-read failed for collection "${col.collectionName}":`, e.message);
      colErrors++;
      hasPreflightErrors = true;
    }

    let toCreate = 0;
    let conflicts = 0;

    for (const item of col.items) {
      const id = col.getId(item);
      if (id && existingIds.has(String(id))) {
        conflicts++;
      } else {
        toCreate++;
      }
    }

    overallSourceCount += col.items.length;
    overallToCreate += toCreate;
    overallConflicts += conflicts;

    preflightReports.push({
      collection: col.collectionName,
      sourceCount: col.items.length,
      existingCount: existingIds.size,
      toCreateCount: toCreate,
      conflictCount: conflicts,
      errorCount: colErrors
    });

    console.log(
      ` • [${col.collectionName.padEnd(12)}] Source: ${String(col.items.length).padStart(4)} | Existing in Firestore: ${String(existingIds.size).padStart(4)} | To Create: ${String(toCreate).padStart(4)} | Overlap/Conflicts: ${String(conflicts).padStart(4)} | Errors: ${colErrors}`
    );
  }

  // Pre-check settings
  const hasSettings = Boolean(dbData.settings && typeof dbData.settings === 'object' && Object.keys(dbData.settings).length > 0);
  let existingSettings = false;
  try {
    const setSnap = await firestore.collection('settings').doc('store_settings').get();
    existingSettings = setSnap.exists;
  } catch (_) {}

  if (hasSettings) {
    overallSourceCount += 1;
    if (existingSettings) overallConflicts += 1;
    else overallToCreate += 1;
    console.log(
      ` • [settings    ] Source:    1 | Existing in Firestore: ${existingSettings ? '   1' : '   0'} | To Create: ${existingSettings ? '   0' : '   1'} | Overlap/Conflicts: ${existingSettings ? '   1' : '   0'} | Errors: 0`
    );
  }

  console.log('----------------------------------------------------------------');
  console.log(` Summary: ${overallSourceCount} source items | ${overallToCreate} new to create | ${overallConflicts} existing overlaps | Errors: ${hasPreflightErrors ? 'YES' : '0'}`);
  console.log('----------------------------------------------------------------');

  if (hasPreflightErrors) {
    console.error('❌ Aborting migration due to Firestore communication errors. Source data untouched.');
    return {
      executed: true,
      success: false,
      totalImported: 0,
      message: 'Aborted due to connection/read errors.'
    };
  }

  console.log('\n⚡ PROCEEDING WITH FIRESTORE BATCH WRITES...\n');

  let totalWritten = 0;
  const recordedCounts: Record<string, number> = {};

  try {
    for (const col of collectionsToMigrate) {
      if (col.items.length === 0) continue;
      console.log(` ⏳ Writing collection: ${col.collectionName} (${col.items.length} items)...`);

      const chunkSize = 400; // Batch limit safe under 500
      let colWritten = 0;

      for (let i = 0; i < col.items.length; i += chunkSize) {
        const chunk = col.items.slice(i, i + chunkSize);
        const batch = firestore.batch();

        for (const item of chunk) {
          const id = col.getId(item);
          if (!id) continue;
          const cleanDoc = JSON.parse(JSON.stringify(item));
          const docRef = firestore.collection(col.collectionName).doc(String(id));
          batch.set(docRef, cleanDoc, { merge: true });
          colWritten++;
          totalWritten++;
        }

        await batch.commit();
      }

      recordedCounts[col.collectionName] = colWritten;
      console.log(`   ✅ Collection [${col.collectionName}] committed: ${colWritten} documents written.`);
    }

    // Write settings
    if (hasSettings) {
      console.log(' ⏳ Writing settings document: settings/store_settings...');
      const cleanSettings = JSON.parse(JSON.stringify(dbData.settings));
      await firestore.collection('settings').doc('store_settings').set(cleanSettings, { merge: true });
      recordedCounts['settings/store_settings'] = 1;
      totalWritten++;
      console.log('   ✅ Settings document committed successfully.');
    }

    // Write permanent completion marker
    const completionMarker = {
      migration_name: 'Indima Spice Co. One-Time Firestore Migration',
      completedAt: new Date().toISOString(),
      source: 'data/db.json',
      status: 'COMPLETED',
      firebase_project: projectId,
      firestore_database: firestoreDbId,
      total_documents: totalWritten,
      record_counts: recordedCounts
    };

    await markerDocRef.set(completionMarker, { merge: true });

    console.log('\n================================================================');
    console.log('FIRESTORE MIGRATION COMPLETED SUCCESSFULLY');
    console.log(`Total documents imported: ${totalWritten}`);
    console.log(`Migration marker locked at: system/migration_status (status: COMPLETED)`);
    console.log('================================================================\n');

    return {
      executed: true,
      success: true,
      totalImported: totalWritten,
      message: 'FIRESTORE MIGRATION COMPLETED SUCCESSFULLY'
    };
  } catch (writeErr: any) {
    console.error('\n❌ Fatal error during Firestore migration write phase:', writeErr.message);
    console.error('⚠️ Note: data/db.json remains completely unmodified and preserved.');
    return {
      executed: true,
      success: false,
      totalImported: totalWritten,
      message: `Migration write error: ${writeErr.message}`
    };
  }
}
