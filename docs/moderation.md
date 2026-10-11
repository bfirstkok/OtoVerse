# Admin moderation

Admin tabs: `/admin?section=reports`, `/admin?section=users`, `/admin?section=logs`.

Users are loaded from Firestore profiles, with search across loaded pages. More records can be loaded as needed. Status changes use a transaction with an immutable admin audit event. Self and other administrator suspension is refused by rules and UI. Account suspension blocks OtoVerse use and authenticated Firestore features, and the AI API checks account status. Firebase Auth credentials remain intact: this is a website suspension, not an Auth user deletion or provider-level disabling. Public news can still be read after signing out.

User activity starts with this release: session start, reports, and song suggestions. These events are client-reported telemetry, not a tamper-proof security/authentication log. Admin moderation events are tied atomically to the database action. No passwords, chat message bodies, IP addresses, or browser fingerprints are added to activity logs.

Storage is not enabled on the current Firebase project. Existing storage configuration was not activated by this change.

Deploy Firestore rules and indexes, then Hosting. Deploy `server/mascot-api` to its existing Vercel project for the explicit suspension response. Per-user logs need the two indexes in firestore.indexes.json.

Tests: Java 21+ and Firebase CLI on PATH, then `npm run test:moderation`. Uses only the demo emulator project, never production. Tests verify ordinary-user isolation, atomic audit, admin protection, suspended/expired/restored sessions, report integrity, immutable logs, and allowed activity fields.
