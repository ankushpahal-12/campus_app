const admin = require('firebase-admin');

// In production, download your service account key and set GOOGLE_APPLICATION_CREDENTIALS
// or pass the object to cert()
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized');
    } else {
        console.warn('Firebase Admin NOT initialized - Missing FIREBASE_SERVICE_ACCOUNT');
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

module.exports = admin;
