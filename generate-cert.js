const { execSync } = require('child_process');
const fs = require('fs');

// Generate self-signed certificate using OpenSSL
try {
  if (!fs.existsSync('key.pem') || !fs.existsSync('cert.pem')) {
    console.log('Generating self-signed certificate...');
    
    // Generate private key
    execSync('openssl genrsa -out key.pem 2048');
    
    // Generate certificate
    execSync('openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=localhost"');
    
    console.log('Certificate generated successfully');
  } else {
    console.log('Certificate files already exist');
  }
} catch (error) {
  console.error('Error generating certificate:', error);
  process.exit(1);
}