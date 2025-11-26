import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}, testInfo) => {
    await page.goto(process.env.URL)
    await page.getByText('Button Triggering AJAX Request').click() 
    testInfo.setTimeout(testInfo.timeout + 2000)
})

test('Auto-waiting', async({page}) => {
    const successButton = page.locator('.bg-success')
    await successButton.click()
    const buttonText = await successButton.textContent()
    await successButton.waitFor({state: "attached"})
    const allButtonText = await successButton.allTextContents() //it does not have auto wait logic by default, so this will fail - we need to implement our own logic for such methods using waitFor (line above)
    expect(allButtonText).toContain('Data loaded with AJAX get request.')

    await expect(successButton).toHaveText('Data loaded with AJAX get request.', {timeout: 20000}) //it fails becasue default timeout limit is 5 seconds and it loads after 15s. Unless we override timeout here
})

test.skip('Alternative waits', async({page}) => {
    const successButton = page.locator('.bg-success')

    // __ wait for element
    //await page.waitForSelector('.bg-success')

    // __ wait for particular response
    //await page.waitForResponse('http://uitestingplayground.com/ajaxdata')
    
    // __ wait for network calls to be completed (not recommended)
    await page.waitForLoadState('networkidle')
    
    const allButtonText = await successButton.allTextContents()
    expect(allButtonText).toContain('Data loaded with AJAX get request.') 
})

test.skip('Timeouts', async({page}) => {
    // test.setTimeout(10000)
    test.slow()
    const successButton =  page.locator('.bg-success')
    await successButton.click({timeout: 16000})
}) 