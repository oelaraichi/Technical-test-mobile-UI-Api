# Technical Test - Mobile UI + API

Projet d'automatisation UI + API en TypeScript.

## Stack
- UI: WebdriverIO + Appium + Cucumber (Gherkin) + Allure
- API: Mocha + Axios + Chai + Mochawesome

## Pourquoi WDIO pour l'UI
- Syntaxe simple et lisible avec POM + Gherkin.
- Tres bonne integration Appium pour Android.
- Reporting Allure facile a generer en HTML.

## Prerequis
- Node.js 18+
- npm
- Java JDK 11+
- Android Studio (SDK + emulator)
- ADB dans le `PATH`

Exemple de verification locale:
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

## Structure
- UI feature: `features/wikipedia_lydia.feature`
- Page Objects UI: `features/pageobjects/`
- Steps Gherkin: `features/step-definitions/`
- Config WDIO: `wdio.conf.ts`
- APK: `app/app-alpha-universal-release.apk`
- API tests: `api-tests/users.api.spec.ts`

## Lancer les tests UI (scenario demande)
```bash
npx wdio run wdio.conf.ts --spec .\features\wikipedia_lydia.feature
```

## Rapport HTML UI (Allure)
```bash
npm run allure:generate
npm run allure:open
```
Rapport genere: `allure-report/index.html`

## Lancer les tests API
```bash
npm run test:api
```
Rapport genere: `api-report/api-report.html`

## Lancer UI + API + generation des rapports
```bash
npm run reports:generate
```

## Notes
- Si l'emulator n'est pas `emulator-5554`, adaptez `appium:udid` dans `wdio.conf.ts`.
- Base URL API modifiable avec:
```bash
set API_BASE_URL=https://reqres.in
```
- Pour les tests API Reqres (legacy), cree une cle API sur:
`https://app.reqres.in/api-keys`
- Puis exporte la cle avant de lancer:
```bash
set REQRES_API_KEY=VOTRE_CLE
```
- Sans cle, le test d'auth passe (controle de protection API) et les tests GET/POST legacy sont marques `pending`.
