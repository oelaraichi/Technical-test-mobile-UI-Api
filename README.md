# Technical Test - Mobile UI + API

Projet d'automatisation UI + API en TypeScript.

## Stack
- UI: WebdriverIO + Appium + Cucumber + Allure
- API: Mocha + Axios + Chai + Mochawesome

## Pourquoi ces technologies
- `TypeScript`: code plus clair, autocompletion, moins d'erreurs.
- `WebdriverIO` (UI): tres bon support E2E et execution locale simple.
- `Appium` (UI mobile): standard pour automatiser une app Android.
- `Cucumber + Gherkin` (UI): lisible pour les profils QA/non dev.
- `Page Object Model` (UI): maintenance plus simple.
- `Allure` (UI): rapport HTML clair pour les tests mobile UI.
- `Mocha + Axios + Chai` (API): Plus simple qu'un framework BDD pour API.
  `Mocha`: runner leger. `Axios`: appels HTTP simples. `Chai`: assertions lisibles.
- `Mochawesome` (API): rapport HTML API separe, conforme au besoin.

## Prerequis
- Node.js 18+
- npm
- Java JDK 11+
- Android Studio (SDK + emulator)
- ADB dans le `PATH`

Verification rapide:
```bash
node -v
npm -v
java -version
adb devices
```

## Installation
```bash
git clone https://github.com/oelaraichi/Technical-test-mobile-UI-Api.git
cd Technical-test-mobile-UI-Api
npm install
```

## Acces direct aux rapports (sans installation)
- UI report (Allure): `https://raw.githack.com/oelaraichi/Technical-test-mobile-UI-Api/main/allure-report/index.html`
- API report (Mochawesome): `https://raw.githack.com/oelaraichi/Technical-test-mobile-UI-Api/main/api-report/api-report.html`

## Structure
- UI feature: `features/wikipedia_lydia.feature`
- UI steps: `features/step-definitions/`
- UI config: `wdio.conf.ts`
- API test: `api-tests/reqres.api.spec.ts`

## Lancer les tests UI
```bash
npm run test:ui
```

## Rapport HTML UI
```bash
npm run allure:generate
npm run allure:open
```
Rapport: `allure-report/index.html`

## Lancer les tests API (simple)
```bash
npm run test:api
```

Partie API implementee:
- GET endpoint: `GET /api/users/2`
- POST endpoint: `POST /api/users`
- Assertions: status code + body validation

Option recommandee pour valider les statuts `200/201`:
```bash
set REQRES_API_KEY=VOTRE_CLE
npm run test:api
```
Cle API: `https://app.reqres.in/api-keys`

## Rapport HTML API
Le rapport est genere automatiquement par `npm run test:api`:
- `api-report/api-report.html`

## Tout lancer en une commande
```bash
npm run reports:generate
```

## Notes
- Si l'emulator n'est pas `emulator-5554`, adapte `appium:udid` dans `wdio.conf.ts`.
- Base URL API modifiable avec:
```bash
set API_BASE_URL=https://reqres.in
```
