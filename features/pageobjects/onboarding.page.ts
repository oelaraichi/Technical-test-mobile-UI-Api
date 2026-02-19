import { $, driver } from '@wdio/globals'

const APP_ID = 'org.wikipedia.alpha:id'
const APP_PACKAGE = 'org.wikipedia.alpha'
const id = (name: string) => `id:${APP_ID}/${name}`

class OnboardingPage {
  get continueButton() {
    return $(id('fragment_onboarding_forward_button'))
  }

  get getStartedButton() {
    return $(id('fragment_onboarding_done_button'))
  }

  get skipButton() {
    return $(id('fragment_onboarding_skip_button'))
  }

  get pageIndicator() {
    return $(id('view_onboarding_page_indicator'))
  }

  get pagerContainer() {
    return $(id('fragment_onboarding_pager_container'))
  }

  get navTabSearch() {
    return $(id('nav_tab_search'))
  }

  get searchContainer() {
    return $(id('search_container'))
  }

  get appCrashWaitButton() {
    return $('id:android:id/aerr_wait')
  }

  get appCrashCloseButton() {
    return $('id:android:id/aerr_close')
  }

  get permissionAllowButton() {
    return $('id:com.android.permissioncontroller:id/permission_allow_button')
  }

  get permissionAllowForegroundOnlyButton() {
    return $('id:com.android.permissioncontroller:id/permission_allow_foreground_only_button')
  }

  get permissionAllowOneTimeButton() {
    return $('id:com.android.permissioncontroller:id/permission_allow_one_time_button')
  }

  private async isHomeVisible() {
    return (
      (await this.navTabSearch.isDisplayed().catch(() => false)) ||
      (await this.searchContainer.isDisplayed().catch(() => false))
    )
  }

  private async isOnboardingVisible() {
    return (
      (await this.continueButton.isDisplayed().catch(() => false)) ||
      (await this.getStartedButton.isDisplayed().catch(() => false)) ||
      (await this.skipButton.isDisplayed().catch(() => false)) ||
      (await this.pagerContainer.isDisplayed().catch(() => false))
    )
  }

  private async isReadyScreenVisible() {
    return (await this.isOnboardingVisible()) || (await this.isHomeVisible())
  }

  private async ensureAppInForeground() {
    const currentPackage = await driver.getCurrentPackage().catch(() => null)
    if (!currentPackage || currentPackage === APP_PACKAGE) return

    await driver.activateApp(APP_PACKAGE).catch(() => {})
    await driver.pause(700)
  }

  private async tapIfDisplayed(el: ReturnType<typeof $>) {
    const target = await el
    if (!(await target.isDisplayed().catch(() => false))) return false
    await target.click().catch(() => {})
    return true
  }

  private async reactivateAfterSystemDialog() {
    await driver.pause(800)
    await driver.activateApp(APP_PACKAGE).catch(() => {})
  }

  private async handleRecoverableDialog() {
    if (await this.tapIfDisplayed(this.appCrashWaitButton)) {
      await this.reactivateAfterSystemDialog()
      return true
    }

    if (await this.tapIfDisplayed(this.appCrashCloseButton)) {
      await this.reactivateAfterSystemDialog()
      return true
    }

    if (await this.tapIfDisplayed(this.permissionAllowButton)) return true
    if (await this.tapIfDisplayed(this.permissionAllowForegroundOnlyButton)) return true
    if (await this.tapIfDisplayed(this.permissionAllowOneTimeButton)) return true

    return false
  }

  private async handleUnknownScreen(unknownScreenPasses: number) {
    const nextPass = unknownScreenPasses + 1

    if (nextPass % 8 === 0) {
      await driver.back().catch(() => {})
      await driver.pause(300)
    }

    if (nextPass % 15 === 0) {
      await driver.terminateApp(APP_PACKAGE).catch(() => {})
      await driver.pause(700)
      await driver.activateApp(APP_PACKAGE).catch(() => {})
      await driver.pause(900)
    }

    return nextPass
  }

  async waitForFirstScreen() {
    const timeoutAt = Date.now() + 60000
    let unknownScreenPasses = 0

    while (Date.now() < timeoutAt) {
      await this.ensureAppInForeground()
      if (await this.isReadyScreenVisible()) return

      const handledDialog = await this.handleRecoverableDialog()
      if (!handledDialog) {
        unknownScreenPasses = await this.handleUnknownScreen(unknownScreenPasses)
      }

      await driver.pause(400)
    }

    throw new Error('Neither onboarding nor home screen became visible')
  }

  private async safeTap(el: ReturnType<typeof $>, timeout = 20000) {
    const target = await el
    await target.waitForDisplayed({ timeout })

    try {
      await target.click()
      return
    } catch {
      const location = await target.getLocation()
      const size = await target.getSize()
      const x = Math.floor(location.x + size.width / 2)
      const y = Math.floor(location.y + size.height / 2)

      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 80 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await driver.releaseActions()
    }
  }

  async tapContinue() {
    await this.safeTap(this.continueButton)
  }

  async tapGetStarted() {
    await this.safeTap(this.getStartedButton)
  }

  async swipeToLastSlide() {
    await this.pagerContainer.waitForDisplayed({ timeout: 20000 })

    const parseIndicator = (desc: string) => {
      const match = desc.match(/Page\s+(\d+)\s+of\s+(\d+)/i)
      if (!match) return null
      return { current: Number(match[1]), total: Number(match[2]) }
    }

    for (let i = 0; i < 12; i++) {
      if (await this.getStartedButton.isDisplayed().catch(() => false)) return

      const indicatorVisible = await this.pageIndicator.isDisplayed().catch(() => false)
      if (indicatorVisible) {
        const desc = (await this.pageIndicator.getAttribute('content-desc')) || ''
        const info = parseIndicator(desc)
        if (info && info.current >= info.total) return
      }

      const container = await this.pagerContainer
      const location = await container.getLocation()
      const size = await container.getSize()

      const startX = Math.floor(location.x + size.width * 0.85)
      const endX = Math.floor(location.x + size.width * 0.15)
      const y = Math.floor(location.y + size.height * 0.5)

      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 120 },
            { type: 'pointerMove', duration: 350, x: endX, y },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await driver.releaseActions()
      await driver.pause(500)
    }

    if (await this.getStartedButton.isDisplayed().catch(() => false)) return
    throw new Error('Could not reach the last onboarding slide')
  }

  async completeOnboarding() {
    await this.waitForFirstScreen()
    if (await this.isHomeVisible()) return

    if (await this.continueButton.isDisplayed().catch(() => false)) {
      await this.tapContinue()
      await driver.pause(400)
    }

    if (await this.isHomeVisible()) return

    await this.swipeToLastSlide()
    await driver.pause(400)

    if (await this.getStartedButton.isDisplayed().catch(() => false)) {
      await this.tapGetStarted()
    }
  }
}

export default new OnboardingPage()
