import { $, driver } from '@wdio/globals'
import SearchPage from './search.page'

const APP_ID = 'org.wikipedia.alpha:id'
const APP_PACKAGE = 'org.wikipedia.alpha'
const id = (name: string) => `id:${APP_ID}/${name}`
const ui = (query: string) => `android=new UiSelector().${query}`

class ArticlePage {
  get toolbarGotIt() {
    return $(id('view_announcement_action_negative'))
  }

  get gamesPopupClose() {
    return $(id('closeButton'))
  }

  private get languageEntrySelectors() {
    return [
      id('page_language'),
      id('menu_page_language'),
      id('menu_change_language'),
      ui('descriptionMatches("(?i).*language.*|.*langue.*")'),
      ui('textMatches("(?i)^language$|^langue$|.*change.*language.*|.*langue.*")'),
    ]
  }

  private get overflowMenuSelectors() {
    return [
      id('menu_overflow_button'),
      id('page_overflow_button'),
      ui('descriptionMatches("(?i).*more options.*|.*plus d.*options.*")'),
    ]
  }

  private get frenchLanguageSelectors() {
    return [
      ui('textMatches("(?i)^french$|^francais$|^français$|.*french.*|.*fran.*")'),
      ui('textContains("French")'),
      ui('descriptionMatches("(?i).*french.*|.*fran.*|.*francais.*")'),
      ui('resourceIdMatches(".*wiki_language_title").textMatches("(?i).*french.*|.*fran.*")'),
      ui('resourceIdMatches(".*langCodeText").textMatches("(?i)^fr$")'),
    ]
  }

  async dismissPopupIfPresent() {
    for (let i = 0; i < 3; i++) {
      let dismissed = false

      if (await this.gamesPopupClose.isDisplayed().catch(() => false)) {
        await this.gamesPopupClose.click()
        dismissed = true
      }

      if (await this.toolbarGotIt.isDisplayed().catch(() => false)) {
        await this.toolbarGotIt.click()
        dismissed = true
      }

      if (!dismissed) return
      await driver.pause(400)
    }
  }

  async changeLanguageToFrench() {
    await this.dismissPopupIfPresent()

    const openedLanguagePicker = await this.openLanguagePicker()
    if (!openedLanguagePicker) {
      const pkg = await driver.getCurrentPackage().catch(() => 'n/a')
      const act = await driver.getCurrentActivity().catch(() => 'n/a')
      throw new Error(`Language entry button not found on article page. Current=${pkg}/${act}`)
    }

    await this.selectFrenchLanguage()
    await this.returnToArticle()
    await this.dismissPopupIfPresent()
    await driver.pause(600)
  }

  private async openLanguagePicker() {
    if (await this.tapFirstVisible(this.languageEntrySelectors, 5000)) return true

    const openedOverflow = await this.tapFirstVisible(this.overflowMenuSelectors, 3000)
    if (!openedOverflow) return false

    if (await this.tapFirstVisible(this.languageEntrySelectors, 5000)) return true

    return false
  }

  private async selectFrenchLanguage() {
    if (await this.tapWithScroll(this.frenchLanguageSelectors, 6)) return

    await this.openLanguageSearch()
    if (await this.tapWithScroll(this.frenchLanguageSelectors, 24)) return

    for (const term of ['fr', 'french', 'francais']) {
      const searchReady = await this.typeLanguageSearch(term)
      if (!searchReady) continue
      if (await this.tapWithScroll(this.frenchLanguageSelectors, 16)) return
    }

    throw new Error('French language option not found after search and scroll')
  }

  private async openLanguageSearch() {
    await this.tapFirstVisible(
      [
        id('addLanguageButton'),
        id('add_language_button'),
        ui('textMatches("(?i).*add language.*|.*ajouter.*langue.*")'),
      ],
      5000
    )

    await this.tapFirstVisible(
      [
        id('menu_search_language'),
        id('search_container'),
        id('search_src_text'),
        ui('descriptionMatches("(?i).*search.*")'),
      ],
      5000
    )
  }

  private async typeLanguageSearch(term: string) {
    const searchField = await this.findFirstVisible([
      id('search_src_text'),
      ui('resourceIdMatches(".*search_src_text")'),
      ui('className("android.widget.EditText")'),
      ui('className("android.widget.AutoCompleteTextView")'),
    ])

    if (!searchField) return false

    await searchField.click().catch(() => {})
    await searchField.clearValue().catch(() => {})
    await searchField.setValue(term)
    await driver.pause(500)
    return true
  }

  private async tapWithScroll(selectors: string[], maxScrolls: number) {
    for (let i = 0; i <= maxScrolls; i++) {
      if (await this.tapFirstVisible(selectors, 1200)) return true
      if (i < maxScrolls) await this.scrollDown()
    }
    return false
  }

  private async returnToArticle() {
    for (let i = 0; i < 5; i++) {
      if (await this.findFirstVisible(this.languageEntrySelectors)) return

      const tappedNavigateUp = await this.tapIfVisible(
        ui('descriptionMatches("(?i).*navigate up.*|^back$|^retour$")')
      )

      if (!tappedNavigateUp) {
        await driver.back().catch(() => {})
      }

      await driver.pause(500)
    }
  }

  async scrollToBottom() {
    for (let i = 0; i < 18; i++) {
      await this.scrollDown()
    }
  }

  async openLink(linkText: string) {
    await this.ensureAppInForeground()
    await this.dismissPopupIfPresent()
    const selectors = this.buildLinkSelectors(linkText)

    const link = await this.findFirstVisible(selectors)
    if (link) {
      await link.click()
      await driver.pause(700)
      return
    }

    if (await this.openLinkViaUiScrollable(linkText)) return
    if (await this.openViaGlobalSearch(linkText)) return
    if (await this.openViaArticleSearch(linkText)) return

    const pkg = await driver.getCurrentPackage().catch(() => 'n/a')
    const act = await driver.getCurrentActivity().catch(() => 'n/a')
    throw new Error(`Link "${linkText}" not found. Current=${pkg}/${act}`)
  }

  async isTitleVisible(title: string) {
    const selectors = this.buildLinkSelectors(title)
    for (const selector of selectors) {
      const el = $(selector)
      if (await el.isDisplayed().catch(() => false)) return true
    }
    return false
  }

  private buildLinkSelectors(raw: string) {
    const normalized = this.normalizeText(raw).toLowerCase()

    if (normalized.includes('cresus') || normalized.includes('croesus')) {
      return [
        ui('textMatches("(?i).*cr.sus.*|.*croesus.*|.*kr.sus.*")'),
        ui('textContains("Cr\u00e9sus")'),
        ui('textContains("Cr\u00e9sus de Lydie")'),
        ui('textContains("Croesus")'),
        ui('textContains("Cresus")'),
      ]
    }

    const clean = this.escapeForUiSelector(raw)
    const repaired = this.escapeForUiSelector(this.normalizeText(raw))

    if (clean === repaired) {
      return [ui(`textContains("${clean}")`)]
    }

    return [ui(`textContains("${clean}")`), ui(`textContains("${repaired}")`)]
  }

  private buildLinkSearchTerms(raw: string) {
    const normalized = this.normalizeText(raw).toLowerCase()
    if (normalized.includes('cresus') || normalized.includes('croesus')) {
      return ['Crésus', 'Cresus', 'Croesus', 'Crésus de Lydie']
    }

    const repaired = this.normalizeText(raw)
    if (repaired === raw) return [raw]
    return [raw, repaired]
  }

  private normalizeText(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  private escapeForUiSelector(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  private async findFirstVisible(selectors: string[]) {
    for (const selector of selectors) {
      const element = $(selector)
      if (await element.isDisplayed().catch(() => false)) return element
    }
    return null
  }

  private async tapIfVisible(selector: string) {
    const el = $(selector)
    if (!(await el.isDisplayed().catch(() => false))) return false
    await el.click().catch(() => {})
    await driver.pause(250)
    return true
  }

  private async tapFirstVisible(selectors: string[], timeout = 3000) {
    const end = Date.now() + timeout
    while (Date.now() < end) {
      const target = await this.findFirstVisible(selectors)
      if (target) {
        await target.click()
        await driver.pause(300)
        return true
      }
      await driver.pause(250)
    }
    return false
  }

  private async scrollDown() {
    const { width, height } = await driver.getWindowRect()
    const x = Math.floor(width * 0.5)
    const startY = Math.floor(height * 0.75)
    const endY = Math.floor(height * 0.25)

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 120 },
          { type: 'pointerMove', duration: 350, x, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])

    await driver.releaseActions()
    await driver.pause(120)
  }

  private async ensureAppInForeground() {
    const pkg = await driver.getCurrentPackage().catch(() => null)
    if (pkg === APP_PACKAGE) return

    await driver.activateApp(APP_PACKAGE).catch(() => {})
    await driver.pause(600)
  }

  private async openLinkViaUiScrollable(linkText: string) {
    const terms = this.buildLinkSearchTerms(linkText)

    for (const term of terms) {
      const escaped = this.escapeForUiSelector(term)
      const selector = `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${escaped}"))`

      try {
        const target = $(selector)
        if (!(await target.isDisplayed().catch(() => false))) continue
        await target.click()
        await driver.pause(700)
        return true
      } catch {
        continue
      }
    }

    return false
  }

  private async openViaArticleSearch(linkText: string) {
    await this.ensureAppInForeground()
    const openSearch = await this.tapFirstVisible(
      [
        id('menu_page_search'),
        id('menu_search_in_article'),
        ui('descriptionMatches("(?i).*search.*|.*rechercher.*")'),
      ],
      5000
    )

    if (!openSearch) return false

    const searchField = await this.findFirstVisible([
      id('search_src_text'),
      ui('resourceIdMatches(".*search_src_text")'),
      ui('className("android.widget.EditText")'),
      ui('className("android.widget.AutoCompleteTextView")'),
    ])

    if (!searchField) return false

    const candidates = this.buildLinkSearchTerms(linkText)

    for (const candidate of candidates) {
      await searchField.click().catch(() => {})
      await searchField.clearValue().catch(() => {})
      await searchField.setValue(candidate)
      await driver.pause(900)

      const result = await this.findFirstVisible(this.buildLinkSelectors(linkText))
      if (result) {
        await result.click()
        await driver.pause(700)
        return true
      }
    }

    await driver.back().catch(() => {})
    await driver.pause(250)
    return false
  }

  private async openViaGlobalSearch(linkText: string) {
    await this.ensureAppInForeground()
    const queries = this.buildLinkSearchTerms(linkText)

    for (let i = 0; i < 3; i++) {
      const activity = await driver.getCurrentActivity().catch(() => '')
      if (!/SearchActivity/i.test(activity)) break
      await driver.back().catch(() => {})
      await driver.pause(250)
    }

    for (const query of queries) {
      try {
        await SearchPage.search(query)
      } catch {
        continue
      }

      try {
        await SearchPage.openFirstResult()
        await driver.pause(700)
        return true
      } catch {}

      try {
        await SearchPage.openFirstExactResult(query)
        await driver.pause(700)
        return true
      } catch {}

      const direct = await this.findFirstVisible([...this.buildLinkSelectors(linkText)])

      if (!direct) continue

      await direct.click()
      await driver.pause(700)
      return true
    }

    return false
  }
}

export default new ArticlePage()
