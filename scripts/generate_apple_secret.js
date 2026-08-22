/**
 * Generate Apple Client Secret JWT for Supabase Auth using native Node.js crypto module (no npm dependencies needed)
 * Usage: node scripts/generate_apple_secret.js <path-to-p8-file> [teamId] [keyId] [clientId]
 */
const fs = require('fs');
const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const p8Path = process.argv[2];
const teamId = process.argv[3] || 'WZMXKCK98R';
const keyId = process.argv[4] || '7Q56FF5CGW';
const clientId = process.argv[5] || 'one.purepulse.partner.sid';

if (!p8Path) {
  console.log('Usage: node scripts/generate_apple_secret.js <path-to-AuthKey.p8> [teamId] [keyId] [clientId]');
  process.exit(1);
}

const privateKey = fs.readFileSync(p8Path, 'utf8');

const header = {
  alg: 'ES256',
  kw: 'jwt',
  kid: keyId,
  typ: 'JWT'
};

const now = Math.floor(Date.now() / 1000);
const exp = now + 15777000; // 6 months (182.6 days)

const payload = {
  iss: teamId,
  iat: now,
  exp: exp,
  aud: 'https://appleid.apple.com',
  sub: clientId
};

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const dataToSign = `${encodedHeader}.${encodedPayload}`;

const signer = crypto.createSign('SHA256');
signer.update(dataToSign);
const signature = signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });

const encodedSignature = base64url(signature);
const jwtToken = `${dataToSign}.${encodedSignature}`;

console.log('\n=================== APPLE CLIENT SECRET JWT ===================\n');
console.log(jwtToken);
console.log('\n===============================================================\n');
console.log('Copy the JWT string above into Supabase "Secret Key (for OAuth)" field.\n');
