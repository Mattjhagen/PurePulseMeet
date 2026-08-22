/**
 * Generate Apple Client Secret JWT for Supabase Auth
 * Usage: node scripts/generate_apple_secret.js <path-to-p8-file> <team-id> <key-id> <client-id>
 */
const fs = require('fs');
const jwt = require('jsonwebtoken');

const p8Path = process.argv[2];
const teamId = process.argv[3] || 'WZMXKCK98R';
const keyId = process.argv[4] || '7Q56FF5CGW';
const clientId = process.argv[5] || 'one.purepulse.partner.sid';

if (!p8Path) {
  console.log('Usage: node scripts/generate_apple_secret.js <path-to-AuthKey.p8> [teamId] [keyId] [clientId]');
  process.exit(1);
}

const privateKey = fs.readFileSync(p8Path, 'utf8');

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // 6 months (max allowed by Apple)
  audience: 'https://appleid.apple.com',
  issuer: teamId,
  subject: clientId,
  keyid: keyId
});

console.log('\n=================== APPLE CLIENT SECRET JWT ===================\n');
console.log(token);
console.log('\n===============================================================\n');
console.log('Copy the JWT string above into Supabase "Secret Key (for OAuth)" field.\n');
