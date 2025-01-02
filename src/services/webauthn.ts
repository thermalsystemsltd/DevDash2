import { base64URLStringToBuffer } from '../utils/base64';

import { bufferToBase64URLString } from '../utils/base64';

interface WebAuthnOptions {
  companyName: string;
  email: string;
}

interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
  authenticatorData: ArrayBuffer;
  signature: ArrayBuffer;
  userHandle: ArrayBuffer | null;
}

interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
  attestationObject: ArrayBuffer;
  getTransports?: () => string[];
}

export const webAuthnApi = {
  async getAuthenticationOptions() {
    const response = await fetch('https://auth.icespyonline.com/auth/webauthn/login/options', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://dash.icespyonline.com'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to get authentication options');
    }

    const data = await response.json();
    
    if (!data.challenge) {
      throw new Error('Server response missing challenge');
    }

    const publicKeyCredentialRequestOptions = {
      challenge: base64URLStringToBuffer(data.challenge),
      timeout: 60000,
      rpId: data.rpId,
      allowCredentials: data.allowCredentials?.map((cred: any) => ({
        ...cred,
        id: base64URLStringToBuffer(cred.id)
      })) || [],
      userVerification: 'required' as UserVerificationRequirement
    };

    return publicKeyCredentialRequestOptions;
  },

  async verifyAuthentication(verificationBody: any) {
    const response = await fetch('https://auth.icespyonline.com/auth/webauthn/login/verify', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://dash.icespyonline.com'
      },
      credentials: 'include',
      body: JSON.stringify(verificationBody)
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json();
  },

  prepareAuthenticationCredential(credential: PublicKeyCredential) {
    const response = credential.response as AuthenticatorAssertionResponse;
    return {
      response: {
        id: credential.id,
        rawId: bufferToBase64URLString(credential.rawId),
        type: credential.type,
        response: {
        authenticatorData: bufferToBase64URLString(response.authenticatorData),
        clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
        signature: bufferToBase64URLString(response.signature)
        }
      }
    };
  },

  async getRegistrationOptions(options: WebAuthnOptions) {
    console.log('Getting registration options for:', options);

    const response = await fetch('https://gateway.icespyonline.com/auth/webauthn/register/options', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        companyName: options.companyName,
        email: options.email
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get registration options');
    }

    const data = await response.json();
    console.log('Registration options response:', data);
    
    if (!data.challenge) {
      throw new Error('Server response missing challenge');
    }
    
    // Convert base64url strings to ArrayBuffer
    const challengeBuffer = base64URLStringToBuffer(data.challenge);
    // Convert user ID to UTF-8 encoded ArrayBuffer
    const userIdBuffer = new TextEncoder().encode(data.user?.id || '').buffer;

    if (!challengeBuffer) {
      throw new Error('Failed to process challenge');
    }

    // Prepare options for navigator.credentials.create
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challengeBuffer,
      rp: data.rp,
      user: {
        id: userIdBuffer,
        name: options.email,
        displayName: options.email
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      timeout: 60000,
      attestation: data.attestation || 'direct',
      excludeCredentials: [],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required'
      }
    };

    console.log('Prepared credential options:', publicKeyCredentialCreationOptions);
    return publicKeyCredentialCreationOptions;
  },

  async verifyRegistration(options: WebAuthnOptions, credential: any) {
    console.log('Verifying registration with credential:', credential);

    const requestBody = {
      companyName: options.companyName,
      email: options.email,
      response: credential
    };

    console.log('Sending verification request:', requestBody);

    const response = await fetch('https://gateway.icespyonline.com/auth/webauthn/register/verify', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: 'Failed to verify registration' 
      }));
      console.error('Registration verification failed:', error);
      throw new Error(error.message || 'Failed to verify registration');
    }

    return response.json();
  },

  prepareCredentialForVerify(credential: PublicKeyCredential) {
    const response = credential.response as AuthenticatorAttestationResponse;

    // Validate required fields
    if (!credential.rawId || !credential.id) {
      console.error('Missing credential ID or rawId');
      throw new Error('Invalid credential: missing ID or rawId');
    }
    
    if (!response.attestationObject || !response.clientDataJSON) {
      console.error('Missing attestation object or client data');
      throw new Error('Invalid authenticator response: missing required data');
    }

    // Create the properly formatted credential object
    return {
      id: credential.id,
      rawId: bufferToBase64URLString(credential.rawId),
      type: "public-key",
      response: {
        clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
        attestationObject: bufferToBase64URLString(response.attestationObject)
      }
    };
  }
};