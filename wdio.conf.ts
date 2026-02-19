import * as path from 'node:path'

const allureOutputDir = path.join(process.cwd(), 'allure-results')

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  specs: ['./features/**/*.feature'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android',
      'appium:udid': 'emulator-5554',
      'appium:app': 'C:\\Projects\\mobile-automation-lydia\\app\\app-alpha-universal-release.apk',
      'appium:appPackage': 'org.wikipedia.alpha',
      'appium:appActivity': 'org.wikipedia.main.MainActivity',
      'appium:appWaitPackage': 'org.wikipedia.alpha',
      'appium:appWaitActivity': 'org.wikipedia.*',
      'appium:autoGrantPermissions': true,
      'appium:disableWindowAnimation': true,
      'appium:newCommandTimeout': 180,
      'appium:waitForIdleTimeout': 0,
    },
  ],
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    [
      'appium',
      {
        args: {
          address: '127.0.0.1',
          port: 4723,
          basePath: '/',
        },
      },
    ],
  ],
  framework: 'cucumber',
  reporters: [
    'spec',
    ['allure', { outputDir: allureOutputDir, disableWebdriverStepsReporting: true }],
  ],
  cucumberOpts: {
    require: ['./features/step-definitions/**/*.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 180000,
    ignoreUndefinedDefinitions: false,
  },
}
