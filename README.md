# Mobile Automation Lydia

Petit projet de test mobile Android avec:
- WebdriverIO (WDIO)
- Appium
- Cucumber (Gherkin)
- Allure Report

## Pourquoi WDIO ?
- Simple a lire et a maintenir.
- Tres bon support Appium + Cucumber.
- Configuration claire en TypeScript.
- Ecosysteme mature (reporting, services, hooks).

## Prerequis
- Node.js 20+ (ou 18+)
- Java JDK 11+
- Android Studio (SDK + emulator)
- ADB dans le PATH

Verification rapide:
bash
node: v24.13.1 
npm: 11.8.0 
java: 11.0.29 
adb: emulator-5554 device 

## Installation depuis zero
1. Cloner le projet puis entrer dans le dossier:
bash
git clone <url-du-repo>
cd mobile-automation-lydia
```

2. Installer les dependances:
```bash
npm install
```

3. Lancer un emulator Android et verifier qu il est visible:
```bash
adb devices
```

## Configuration importante
- APK utilise: `app/app-alpha-universal-release.apk`
- Config WDIO: `wdio.conf.ts`
- Feature principale: `features/wikipedia_lydia.feature`

Si votre emulator n est pas `emulator-5554`, adaptez `appium:udid` dans `wdio.conf.ts`.

## Lancer les tests
```bash
npm run test:ui
```

## Allure Report
Generer le report:
```bash
npm run allure:generate
```

Ouvrir le report:
```bash
npm run allure:open
```

Faire les 2 en une commande:
```bash
npm run allure:report
```

## Workflow conseille
1. Demarrer emulator
2. `npm run test:ui`
3. `npm run allure:report`

