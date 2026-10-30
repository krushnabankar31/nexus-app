/**
 * Cleanup script: Deletes fake/seeded users from Firestore users collection.
 * Keeps only real authenticated Firebase users (those with valid Firebase UID format).
 *
 * Run: node scripts/cleanup-fake-users.mjs
 */

const PROJECT_ID = 'nexus-app-6193e';
const API_KEY = 'AIzaSyBNEs2RjR4TlYQewz2PCBdoy-KGWWF6zoU';

// Firestore REST base URL
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function listUsers() {
  const url = `${FIRESTORE_BASE}/users?key=${API_KEY}&pageSize=100`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to list users: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.documents || [];
}

async function deleteDocument(docPath) {
  const url = `https://firestore.googleapis.com/v1/${docPath}?key=${API_KEY}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    console.warn(`  ⚠ Failed to delete ${docPath}: ${res.status}`);
  }
}

// Firebase UIDs are 28 chars, alphanumeric.
// Fake IDs look like: "user-1", "user_luna", "user-luna-hartwell", "u_001" etc.
function isRealFirebaseUID(id) {
  // Firebase Auth UIDs are 28 chars, only letters and digits
  return /^[A-Za-z0-9]{20,}$/.test(id);
}

async function main() {
  console.log('📋 Fetching users from Firestore...');
  let docs;
  try {
    docs = await listUsers();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }

  if (!docs.length) {
    console.log('ℹ No users found in Firestore.');
    return;
  }

  console.log(`Found ${docs.length} user document(s):\n`);

  const toDelete = [];
  const toKeep = [];

  for (const doc of docs) {
    // doc.name = "projects/.../documents/users/DOC_ID"
    const id = doc.name.split('/').pop();
    const displayName = doc.fields?.displayName?.stringValue || doc.fields?.username?.stringValue || '(no name)';
    const email = doc.fields?.email?.stringValue || '(no email)';

    const isReal = isRealFirebaseUID(id);
    console.log(`  ${isReal ? '✅ KEEP' : '🗑 DELETE'} | ID: ${id} | ${displayName} | ${email}`);

    if (isReal) {
      toKeep.push({ id, displayName, email });
    } else {
      toDelete.push({ id, name: doc.name, displayName });
    }
  }

  console.log(`\n📊 Summary: ${toKeep.length} real user(s) to keep, ${toDelete.length} fake user(s) to delete.\n`);

  if (toDelete.length === 0) {
    console.log('✅ No fake users found. Nothing to delete.');
    return;
  }

  console.log('🗑 Deleting fake users...');
  for (const fake of toDelete) {
    process.stdout.write(`  Deleting "${fake.displayName}" (${fake.id})... `);
    await deleteDocument(fake.name);
    console.log('✅ done');
  }

  console.log('\n✅ Cleanup complete! Only real Firebase users remain.');
}

main().catch(console.error);
