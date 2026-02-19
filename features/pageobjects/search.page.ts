import { $, driver } from '@wdio/globals'

const APP_ID = 'org.wikipedia.alpha:id'
const id = (name: string) => `id:${APP_ID}/${name}`
const ui = (query: string) => `android=new UiSelector().${query}`

class SearchPage {
  get exploreSearchHint() {
    return $(ui('textContains("Search Wikipedia")'))
  }

  get navTabSearch() {
    return $(id('nav_tab_search'))
  }

  get searchContainer() {
    return $(id('search_container'))
  }

  get searchInput() {
    return $(id('search_src_text'))
  }

  get genericAutoComplete() {
    return $(ui('className("android.widget.AutoCompleteTextView")'))
  }

  get genericEditText() {
    return $(ui('className("android.widget.EditText")'))
  }

  get firstResultTitle() {
    return $(id('page_list_item_title'))
  }

  get firstResultContainer() {
    return $(id('page_list_item_container'))
  }

  get lydiaCitySubtitle() {
    return $(ui('className("android.widget.TextView").textMatches("(?i).*anatolian.*kingdom.*|.*royaume.*anatol.*")'))
  }

  private async tap(el: ReturnType<typeof $>, timeout = 20000) {
    const target = await el
    await target.waitForDisplayed({ timeout })
    await target.waitForEnabled({ timeout })

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

  private async findVisibleSearchInput() {
    const candidates = [
      this.searchInput,
      $(ui('resourceIdMatches(".*search_src_text")')),
      this.genericAutoComplete,
      this.genericEditText,
    ]

    for (const candidate of candidates) {
      if (await candidate.isDisplayed().catch(() => false)) return candidate
    }

    return null
  }

  private async isSearchScreenVisible() {
    return (await this.findVisibleSearchInput()) !== null
  }

  private async waitForSearchScreen(timeout = 30000, timeoutMsg = 'Search screen not ready') {
    await driver.waitUntil(async () => this.isSearchScreenVisible(), {
      timeout,
      interval: 500,
      timeoutMsg,
    })
  }

  private async waitForSearchScreenSafe(timeout = 3000) {
    try {
      await this.waitForSearchScreen(timeout, '')
      return true
    } catch {
      return false
    }
  }

  private async dismissBlockingDialogs() {
    const dialogs = [
      $(id('closeButton')),
      $(ui('descriptionMatches("(?i)^close$")')),
      $(id('view_announcement_action_negative')),
    ]

    for (let i = 0; i < 3; i++) {
      let dismissed = false

      for (const dialog of dialogs) {
        if (!(await dialog.isDisplayed().catch(() => false))) continue
        await dialog.click().catch(() => {})
        dismissed = true
      }

      if (!dismissed) return
      await driver.pause(300)
    }
  }

  async openSearch() {
    await this.dismissBlockingDialogs()
    if (await this.isSearchScreenVisible()) return

    const activity = await driver.getCurrentActivity().catch(() => '')
    if (/SearchActivity/i.test(activity)) {
      if (await this.waitForSearchScreenSafe(1500)) return
      await driver.back().catch(() => {})
      await driver.pause(300)
      if (await this.waitForSearchScreenSafe(1500)) return
    }

    const entryPoints = [
      this.navTabSearch,
      this.searchContainer,
      this.exploreSearchHint,
      $(ui('descriptionMatches("(?i).*search.*")')),
    ]

    for (let pass = 0; pass < 4; pass++) {
      await this.dismissBlockingDialogs()

      for (const entryPoint of entryPoints) {
        if (!(await entryPoint.isDisplayed().catch(() => false))) continue
        await this.tap(entryPoint, 15000)
        if (await this.waitForSearchScreenSafe(5000)) return
      }

      await driver.pause(400)
    }

    const pkg = await driver.getCurrentPackage().catch(() => 'n/a')
    const act = await driver.getCurrentActivity().catch(() => 'n/a')
    throw new Error(`Could not open Search screen. Current=${pkg}/${act}`)
  }

  async search(query: string) {
    await this.openSearch()
    await this.waitForSearchScreen(30000, 'Search input not visible')

    const input = await this.findVisibleSearchInput()
    if (!input) throw new Error('Search input not found')

    await this.tap(input, 30000)
    await input.clearValue().catch(() => {})
    await input.setValue(query)
    await driver.pause(1000)
  }

  async openFirstExactResult(_text: string) {
    if (await this.lydiaCitySubtitle.waitForDisplayed({ timeout: 25000 }).catch(() => false)) {
      await this.tap(this.lydiaCitySubtitle, 5000)
      await driver.pause(800)
      return
    }

    if (await this.firstResultTitle.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.firstResultTitle, 5000)
      await driver.pause(800)
      return
    }

    if (await this.firstResultContainer.waitForDisplayed({ timeout: 5000 }).catch(() => false)) {
      await this.tap(this.firstResultContainer, 5000)
      await driver.pause(800)
      return
    }

    throw new Error('No visible first result row')
  }

  async openFirstResult() {
    if (await this.firstResultTitle.isDisplayed().catch(() => false)) {
      await this.tap(this.firstResultTitle, 5000)
      await driver.pause(800)
      return
    }

    if (await this.firstResultContainer.isDisplayed().catch(() => false)) {
      await this.tap(this.firstResultContainer, 5000)
      await driver.pause(800)
      return
    }

    const generic = $(ui('resourceIdMatches(".*page_list_item_title|.*page_list_item_container")'))
    if (await generic.isDisplayed().catch(() => false)) {
      await this.tap(generic, 5000)
      await driver.pause(800)
      return
    }

    throw new Error('No visible search result to open')
  }
}

export default new SearchPage()
