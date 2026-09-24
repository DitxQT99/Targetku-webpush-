# Research Notes — 24 September 2026

Web research informed this architecture.

1. The Push API delivers pushes to an active Service Worker, where a `push` event can be handled.
2. Persistent mobile notifications should be created from the Service Worker with `ServiceWorkerRegistration.showNotification()`.
3. VAPID is used by the application server to authenticate Web Push requests; the public key is used for subscription and the private key stays server-side.
4. Vercel Cron triggers Vercel Functions with HTTP GET. Cron timezone is UTC.
5. Vercel Hobby cron is limited to once per day; Pro/Enterprise have per-minute precision.
6. Neon supplies a serverless PostgreSQL driver for server-side JavaScript and exposes the connection through `DATABASE_URL`.
7. `web-push` provides VAPID configuration and `sendNotification()`.

Implementation:
Vercel Cron -> Serverless Function -> Neon due-reminder rows -> web-push/VAPID -> browser push service -> Service Worker -> Android notification.
