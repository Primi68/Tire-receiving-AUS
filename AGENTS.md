# Repository rules

- Never commit real trailer numbers, Dock records, shipment data, sticker details, location notes, photos, credentials, signing keys, or exported backups. Use fictional `DEMO-*` values in tests, screenshots, issues, and releases. Private visibility does not waive this rule.
- Keep the primary workflow fast: tire selection → rack color → expected formula → match or adjust → save.
- Blue and Orange rack capacity is stored per tire and color. Do not make one global capacity for a color.
- Preserve the formula `quantity per rack × 4 × group count + extra quantity` and show expected-versus-actual difference.
- Offline, single-user MVP. Do not add analytics, account login, or cloud synchronization without a new product requirement.
- Preserve browser local storage and Android WebView storage compatibility. Backup imports must be validated before replacing current data.
- Android release builds require the fixed project signing key. Never publish a debug-signed APK as a release or commit signing credentials.
- Run `npm test`, `npm run check`, Android release assembly, lint, and signing-certificate verification before publishing an APK. Do not claim physical-phone testing unless it was performed.
