/**
 * PocketBase collection setup script for Kumzitz.
 *
 * Creates the `songs` collection with proper fields and API rules.
 *
 * Usage:
 *   npx tsx scripts/setup-pocketbase.ts
 *
 * Environment variables:
 *   PB_URL       — PocketBase URL (default: https://pastacalc.fly.dev)
 *   PB_ADMIN      — Superuser email
 *   PB_PASSWORD   — Superuser password
 */

const PB_URL = process.env.PB_URL || 'https://pastacalc.fly.dev';

async function authenticate(): Promise<string> {
  const email = process.env.PB_ADMIN;
  const password = process.env.PB_PASSWORD;

  if (!email || !password) {
    console.error('Missing PB_ADMIN or PB_PASSWORD environment variables.');
    console.error('Usage: PB_ADMIN=admin@example.com PB_PASSWORD=secret npx tsx scripts/setup-pocketbase.ts');
    process.exit(1);
  }

  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Auth failed (${res.status}): ${body}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log('Authenticated as superuser.');
  return data.token;
}

async function createCollection(token: string, collection: Record<string, unknown>): Promise<void> {
  const name = collection.name as string;

  // Check if collection already exists
  const checkRes = await fetch(`${PB_URL}/api/collections/${name}`, {
    headers: { Authorization: token },
  });

  if (checkRes.ok) {
    console.log(`Collection "${name}" already exists — updating...`);

    const existing = await checkRes.json();
    const updateRes = await fetch(`${PB_URL}/api/collections/${existing.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(collection),
    });

    if (!updateRes.ok) {
      const body = await updateRes.text();
      console.error(`Failed to update "${name}" (${updateRes.status}): ${body}`);
      process.exit(1);
    }

    console.log(`Collection "${name}" updated.`);
    return;
  }

  // Create new collection
  const res = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(collection),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Failed to create "${name}" (${res.status}): ${body}`);
    process.exit(1);
  }

  console.log(`Collection "${name}" created.`);
}

// --- Collection definitions ---

const songsCollection = {
  name: 'songs',
  type: 'base',

  // API rules:
  // - Anyone can list/view public songs
  // - Authenticated users can create
  // - Only the author can update/delete their own songs
  listRule: 'isPublic = true || author = @request.auth.id',
  viewRule: 'isPublic = true || author = @request.auth.id',
  createRule: '@request.auth.id != ""',
  updateRule: 'author = @request.auth.id',
  deleteRule: 'author = @request.auth.id',

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      min: 1,
      max: 500,
    },
    {
      name: 'artist',
      type: 'text',
      required: true,
      min: 1,
      max: 500,
    },
    {
      name: 'content',
      type: 'text',
      required: true,
      min: 1,
      max: 100000,
    },
    {
      name: 'originalKey',
      type: 'text',
      required: false,
      max: 10,
    },
    {
      name: 'bpm',
      type: 'number',
      required: false,
      min: 0,
      max: 999,
    },
    {
      name: 'isPublic',
      type: 'bool',
      required: false,
    },
    {
      name: 'author',
      type: 'relation',
      required: true,
      collectionId: '_pb_users_auth_',
      maxSelect: 1,
      cascadeDelete: false,
    },
  ],

  indexes: [
    'CREATE INDEX idx_songs_author ON songs (author)',
    'CREATE INDEX idx_songs_isPublic ON songs (isPublic)',
  ],
};

// --- Main ---

async function main() {
  console.log(`Setting up PocketBase at ${PB_URL}...\n`);

  const token = await authenticate();

  await createCollection(token, songsCollection);

  console.log('\nSetup complete!');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
