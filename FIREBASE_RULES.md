# TradePro Academy - Firebase Security Rules

Paste these rules into your **Firebase Console** under:
1. **Firestore Database** -> **Rules** tab
2. **Storage** -> **Rules** tab

---

## 1. Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: check if authenticated user is in admin list
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.email in [
          'bilalkhan@gmail.com',
          'admin@example.com',
          'admin@tradepro.com',
          'chatgptgo12monthsfree@gmail.com'
        ] || 
        // Or check role field in user's profile document if verified
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }

    // Default deny: Unauthenticated users can read and write NOTHING
    match /{document=**} {
      allow read, write: if false;
    }

    // USERS COLLECTION
    // Users can read and write only their own document
    // Admins can read and update all user profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // COURSES COLLECTION
    // Logged-in users can only read published courses (isPublished == true)
    // Admins can read all courses (including drafts) and create, update, or delete
    match /courses/{courseId} {
      allow read: if isAuthenticated() && (resource.data.isPublished == true || isAdmin());
      allow create, update, delete: if isAdmin();
    }

    // SETTINGS COLLECTION (settings/site)
    // Any logged-in user can read site settings (siteName, logo, WhatsApp number, announcement)
    // Only admins can modify or write site settings
    match /settings/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

---

## 2. Firebase Cloud Storage Security Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.email in [
          'admin@example.com',
          'admin@tradepro.com',
          'chatgptgo12monthsfree@gmail.com'
        ]
      );
    }

    // Default deny for unauthenticated users
    match /{allPaths=**} {
      allow read, write: if false;
    }

    // Course thumbnails and site branding images
    // Any authenticated user can view thumbnails and site banners
    // Only admin can upload, replace or delete images (max 10MB, images only)
    match /courses/{imageName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin()
                    && request.resource.size < 10 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*');
    }

    match /settings/{imageName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin()
                    && request.resource.size < 10 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Summary of Permissions

| Collection / Path | Logged-Out Users | Logged-In Normal User | Admin User |
|---|---|---|---|
| `/` (Any Public Route) | **Blocked** (Redirect to `/login`) | Accessible | Accessible |
| `/users/{id}` | No Access | Read & Update Own Profile | Full Access |
| `/courses/{id}` | No Access | Read Published Only (`isPublished: true`) | Full CRUD (Drafts + Published) |
| `/settings/site` | No Access | Read Only | Read & Write |
| Storage `/courses/*` | No Access | View Only | Upload / Delete Images |
