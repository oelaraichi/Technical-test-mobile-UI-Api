import { Given, When, Then } from '@wdio/cucumber-framework'
import { driver, expect } from '@wdio/globals'

import OnboardingPage from '../pageobjects/onboarding.page'
import SearchPage from '../pageobjects/search.page'
import ArticlePage from '../pageobjects/article.page'

Given('I launch the app', async () => {
  await driver.terminateApp('org.wikipedia.alpha').catch(() => {})
  await driver.activateApp('org.wikipedia.alpha').catch(() => {})

  await OnboardingPage.waitForFirstScreen()
})

Given('I complete onboarding', async () => {
  await OnboardingPage.completeOnboarding()
})

When('I search for {string}', async (query: string) => {
  await SearchPage.search(query)
})

When('I scroll results until I find the city {string}', async (city: string) => {
  await SearchPage.openFirstExactResult(city)
})

When('I dismiss the popup if it appears', async () => {
  await ArticlePage.dismissPopupIfPresent()
})

When('I change the language to French', async () => {
  await ArticlePage.changeLanguageToFrench()
})

When('I scroll to the bottom of the page', async () => {
  await ArticlePage.scrollToBottom()
})

When('I open {string} from the page', async (linkText: string) => {
  await ArticlePage.openLink(linkText)
})

Then('the {string} page should be displayed', async (title: string) => {
  const ok = await ArticlePage.isTitleVisible(title)
  await expect(ok).toBe(true)
})
