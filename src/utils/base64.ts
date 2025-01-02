export function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  // Input validation
  if (typeof base64URLString !== 'string') {
    throw new Error(`Input must be a string, got ${typeof base64URLString}`);
  }

  // Remove whitespace
  const cleaned = base64URLString.replace(/\s/g, '');

  try {
    // Step 1: Convert base64URL to base64 by replacing URL-safe chars
    const base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/');

    // Step 2: Add padding if needed
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    // Convert base64 to binary string
    const binary = atob(padded);
    
    // Convert binary string to buffer
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  } catch (error) {
    console.error('Base64 decode error:', error, 'for input:', base64URLString);
    throw new Error('Failed to decode WebAuthn challenge. Please try again.');
  }
}

export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  if (!(buffer instanceof ArrayBuffer)) {
    throw new Error('Invalid input: expected ArrayBuffer');
  }
  
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  
  try {
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error('Failed to encode buffer to base64');
  }
}