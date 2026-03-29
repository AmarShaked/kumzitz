import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://pastacalc.fly.dev');

// Enable auto-cancellation for duplicate requests
pb.autoCancellation(false);
