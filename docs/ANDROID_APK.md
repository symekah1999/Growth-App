# Installing Growth OS & building an Android APK

Growth OS is a PWA served at https://growth-app-ruddy-two.vercel.app.

## Install (no APK needed)
- Android/Chrome: ⋮ menu → Install app.
- iPhone/Safari: Share → Add to Home Screen.
- Desktop Chrome/Edge: install icon in the address bar, or the Install app page inside the app.

## Real .apk via PWABuilder (GUI, no Android Studio)
1. https://www.pwabuilder.com → enter the URL → Start. Fix anything flagged (should be green).
2. Package for stores → Android. Package ID `com.symekah.growthos`, name `Growth OS`, signing key: New.
3. Download the zip: `*.apk` (sideload), `*.aab` (Google Play), `signing.keystore` + `signing-key-info.txt` (BACK THESE UP), `assetlinks.json`.
4. Copy `assetlinks.json` to `public/.well-known/assetlinks.json`, commit and push. The middleware already lets `/.well-known/*` through, so Vercel serves it publicly. This removes the browser address bar inside the APK.
5. On the phone: copy the .apk over, allow "Install unknown apps", open it.

## Alternative: Bubblewrap CLI (needs JDK 17 + Android SDK)
`npm i -g @bubblewrap/cli && bubblewrap init --manifest=https://growth-app-ruddy-two.vercel.app/manifest.json && bubblewrap build`
