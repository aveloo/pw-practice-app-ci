import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('/') //before methods that are of type Promise we have to use the await keyword. And in order to use that keyword we need to use async keyword before the function
    await page.getByText('Forms').click() 
    await page.getByText('Form Layouts').click() 
})

test('Locator syntax rules', async({page}) => {
    //by Tag name
    page.locator('input')

    //by ID
    page.locator('#inputEmail1')

    //by Class value
    page.locator('.shape-rectangle')

    //by Attribute
    page.locator('[placeholder="Email"]')

    //by Class value (full)
    page.locator('[class="input-full-width size-medium status-basic shape-rectangle nb-transition"]')

    //Combine different selectors
    page.locator('input[placeholder="Email"][nbinput]')

    //by xPath (NOT RECOMMENDED)
    page.locator('//*[@id="inputEmail1"]')

    //by Partial text match
    page.locator(':text("Using")')

    //by Exact text match
    page.locator(':text-is("Using the Grid")')
})

test('User facing locators', async({page}) => {
    await page.getByRole('textbox', {name: "Email"}).first().click()
    await page.getByRole('button', {name: "Sign in"}).first().click()
    await page.getByLabel('Email').first().click()
    await page.getByPlaceholder('Jane Doe').click()
    await page.getByText('Using the Grid').click()
    await page.getByTestId('SignIn').click() //not really user facing
    await page.getByTitle('IoT Dashboard').click()
})

test('Locating child elements', async({page}) => {
    await page.locator('nb-card nb-radio :text-is("Option 1")').click() //separate string locators with space to find child elements
    await page.locator('nb-card').locator('nb-radio').locator(':text-is("Option 2")').click()
    await page.locator('nb-card').getByRole('button', {name: "Sign In"}).first().click() //bn-card not really needed here, it's just here to show you can mix regular locators with user-facing ones
    await page.locator('nb-card').nth(3).getByRole('button').click() //index, less preferable as well as .first() and .last()
})

test('Locating parent elements', async({page}) => {
    await page.locator('nb-card', {hasText: "Using the Grid"}).getByRole('textbox', {name: "Email"}).click() //filtering by text
    await page.locator('nb-card', {has: page.locator('#inputEmail1')}).getByRole('textbox', {name: "Email"}).click() //filtering by locator
    await page.locator('nb-card').filter({hasText: "Basic form"}).getByRole('textbox', {name: "Email"}).click() //filtering by independent method - good becasue getByRole does not have filters like filter() does and because we may chain those filters
    await page.locator('nb-card').filter({has: page.locator('.status-danger')}).getByRole('textbox', {name: "Password"}).click()
    await page.locator('nb-card').filter({has: page.locator('nb-checkbox')}).filter({hasText: "Sign in"}).getByRole('textbox', {name: "Email"}).click() //filter chaining
    await page.locator(':text-is("Using the Grid")').locator('..').getByRole('textbox', {name: "Email"}).click() //going one level up using xPaths - not recommended
})

test('Reusing the locators', async({page}) => {

    const basicForm = page.locator('nb-card').filter({hasText: "Basic form"})
    const emailField = basicForm.getByRole('textbox', {name: "Email"})

    await emailField.fill('test@test.com')
    await basicForm.getByRole('textbox', {name: "Password"}).fill('Welcome123')
    await basicForm.locator('nb-checkbox').click()
    await basicForm.getByRole('button').click()

    await expect(emailField).toHaveValue('test@test.com')
})

test('Extracting values', async({page}) => {
    // Single text value
    const basicForm = page.locator('nb-card').filter({hasText: "Basic form"})
    const buttonText = await basicForm.locator('button').textContent()
    expect(buttonText).toEqual('Submit')

    // All text values
    const allRadiouttonsLabels = await page.locator('nb-radio').allTextContents()
    expect(allRadiouttonsLabels).toContain("Option 1")

    // Input value
    const emailField = basicForm.getByRole('textbox', {name: "Email"})
    await emailField.fill('test@test.com')
    const emailValue = await emailField.inputValue()
    expect(emailValue).toEqual('test@test.com')

    // Attribute value
    const placeholderValue =  await emailField.getAttribute('placeholder')
    expect(placeholderValue).toEqual("Email")
})

test('Assertions', async({page}) => {
    const basicFormButton = page.locator('nb-card').filter({hasText: "Basic form"}).locator('button')
    // General assertion - we provide exact value to compare
    const value = 5
    expect(value).toEqual(5)
    const buttonText = await basicFormButton.textContent()
    expect(buttonText).toEqual("Submit")

    // Locator assertion - we provide a locator to compare
    await expect(basicFormButton).toHaveText("Submit")

    // Soft assertion - test continues even if the assertion failed
    await expect.soft(basicFormButton).toHaveText("Submi5t")
    await basicFormButton.click()
})