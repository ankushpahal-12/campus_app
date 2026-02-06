const admin = require('firebase-admin');

const secrets = require('./secrets');

// In production, download your service account key and set GOOGLE_APPLICATION_CREDENTIALS
// or pass the object to cert()
try {
    if (secrets.firebaseServiceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(secrets.firebaseServiceAccount)
        });
        console.log('Firebase Admin initialized');
    } else {
        console.warn('Firebase Admin NOT initialized - Missing FIREBASE_SERVICE_ACCOUNT');
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

module.exports = admin;
