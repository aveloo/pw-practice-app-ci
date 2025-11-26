import { test } from '@playwright/test'
import { PageManager } from '../page-objects/pageManager'  
import { faker } from '@faker-js/faker'  
import { argosScreenshot } from "@argos-ci/playwright";

test.beforeEach(async({page}) => {
    await page.goto('/')
})

test('Navigate to Form Page @smoke @regression', async({page}) => {
    const pm = new PageManager(page)
    await pm.navigateTo().formLayoutsPage()
    await pm.navigateTo().datePickerPage()
    await pm.navigateTo().smartTablePage()
    await pm.navigateTo().toastrPage()
    await pm.navigateTo().tooltipPage()
})

test('Parametrized methods @smoke', async({page}) => {
    const pm = new PageManager(page)
    const randomFullName = faker.person.fullName()
    const randomEmail = randomFullName.replace(/ /g, "") + faker.number.int(1000) + "@test.com"
    await pm.navigateTo().formLayoutsPage()
    await pm.onFormLayoutsPage().submitUsingTheGridFormWithCredentialsAndSelectOption(process.env.USERNAME, process.env.PASSWORD, "Option 1")

    await page.screenshot({path: "screenshots/formLayoutsPage.png"})
    const buffer = await page.screenshot()
    console.log(buffer.toString('base64'))

    await pm.onFormLayoutsPage().submitInlineFormWithNameEmailAndCheckbox(randomFullName, randomEmail, true)

    await page.locator('nb-card', {hasText: "Inline form"}).screenshot({path: "screenshots/inlineForm.png"})

    await pm.navigateTo().datePickerPage()
    await pm.onDatepickerPage().selectCommonDatePickerDateFromToday(10)
    await pm.onDatepickerPage().selectDatePickerWithRangeFromToday(6,15)
})

test.only('Testing with Argos CI', async({page}) => {
    const pm = new PageManager(page)
    await pm.navigateTo().formLayoutsPage()
    await argosScreenshot(page, "Form Layouts Page");
    await pm.navigateTo().datePickerPage()
    await argosScreenshot(page, "Date Picker Page");
})