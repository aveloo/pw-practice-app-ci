import { MaxValidator } from '@angular/forms'
import {test, expect} from '@playwright/test'

test.describe.configure({mode: "parallel"})

test.beforeEach(async({page}) => {
    await page.goto('/')
})

test.describe('Form Layouts page', () => {
    test.describe.configure({retries: 0})
    test.describe.configure({mode: "serial"})
    test.beforeEach(async({page}) => {
        await page.getByText('Forms').click()
        await page.getByText('Form Layouts').click() 
    })

    test('Input fields', async({page}, testInfo) =>{
        if(testInfo.retry) {
            //i.e. database cleanup
        }
        const usingTheGridEmailInput = page.locator('nb-card', {hasText: "Using the Grid"}).getByRole('textbox', {name: "Email"})
        await usingTheGridEmailInput.fill('test@test.com')
        await usingTheGridEmailInput.clear() //cannot chain this method
        await usingTheGridEmailInput.pressSequentially('test2@test.com') //simulate the keystrokes of the keyboard

        // Generic assertion
        const inputValue = await usingTheGridEmailInput.inputValue() //extract the test from the input field
        expect(inputValue).toEqual('test2@test.com')

        // Locator assertion
        await expect(usingTheGridEmailInput).toHaveValue('test2@test.co8m')
    })

    test.only('Radio buttons', async({page}) => {
        const usingTheGridForm = page.locator('nb-card', {hasText: "Using the Grid"})
        // await usingTheGridForm.getByLabel('Option 2').check({force: true}) //select radio button. Force true is because the radio button in this app has a class "visually hidden", so Playwright wouldn't be able to select this option without forcing it
        await usingTheGridForm.getByRole('radio', {name: "Option 2"}).check({force: true})
        const radioStatus = await usingTheGridForm.getByRole('radio', {name: "Option 1"}).isChecked() //check if the radio button is selected
        // Visual comparison
        await expect(usingTheGridForm).toHaveScreenshot({maxDiffPixels: 250})

        // expect(radioStatus).toBeTruthy() //one way of validating radio button status
        // await expect(usingTheGridForm.getByRole('radio', {name: "Option 1"})).toBeChecked() //another way using the locator
        // await usingTheGridForm.getByRole('radio', {name: "Option 2"}).check({force: true})
        // expect(await usingTheGridForm.getByRole('radio', {name: "Option 1"}).isChecked()).toBeFalsy()
        // expect(await usingTheGridForm.getByRole('radio', {name: "Option 2"}).isChecked()).toBeTruthy()
    })
})
test('Checkboxes', async({page}) => {
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Toastr').click()
    await page.getByRole('checkbox', {name: 'Hide on click'}).uncheck({force: true}) //visually hidden again. We can either use click or check for checkboxes, but using check() for already checked checkboxes will not unselect them - there is an uncheck() method for that
    await page.getByRole('checkbox', {name: 'Prevent arising of duplicate toast'}).check({force: true})
    const allBoxes = page.getByRole('checkbox')
    for(const box of await allBoxes.all()) { //allBoxes is not an array so we need to convert it using all()
        await box.uncheck({force: true})
        expect(await box.isChecked()).toBeFalsy()
    }

})
test('Lists & Dropdowns', async({page}) => {
    const dropdownMenu = page.locator('ngx-header nb-select')
    await dropdownMenu.click()

    //page.getByRole('list') //when the list has a UL/OL tag
    //page.getByRole('listitem') //when the list has LI tag

    //const optionList = page.getByRole('list').locator('nb-option') - less compact way
    const optionList = page.locator('nb-option-list nb-option') //more compact way
    await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"]) //the order matters here
    await optionList.filter({hasText: "Cosmic"}).click()
    const header = page.locator('nb-layout-header')
    await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)')
    const colours = {
        "Light": "rgb(255, 255, 255)",
        "Dark": "rgb(34, 43, 69)",
        "Cosmic": "rgb(50, 50, 89)",
        "Corporate": "rgb(255, 255, 255)"
    }
    await dropdownMenu.click()
    for(const colour in colours) {
        await optionList.filter({hasText: colour}).click()
        await expect(header).toHaveCSS('background-color', colours[colour])
        if(colour != "Corporate")
            await dropdownMenu.click()
    }
})

test('Tooltips', async({page}) => { //to see the tooltip in the browser we need to inspect the element and then freeze the browser using F8
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Tooltip').click()
    const tooltipCard = page.locator('nb-card', {hasText: "Tooltip Placements"})
    await tooltipCard.getByRole('button', {name: "Top"}).hover()
    page.getByRole('tooltip') //works if the element has the "tooltip" role created (not the case here unfortunately)
    const tooltip = await page.locator('nb-tooltip').textContent()
    expect(tooltip).toEqual("This is a tooltip")
})

test('Dialog boxes', async({page}) => {
    await page.getByText("Tables & Data").click()
    await page.getByText("Smart Table").click()

    page.on('dialog', dialog => { //playwright automatically detects alert dialog boxes and cancels them, so we create a listener that accepts this dialog so we can see it
        expect(dialog.message()).toEqual("Are you sure you want to delete?")
        dialog.accept()
    })

    await page.getByRole('table').locator('tr', {hasText: "mdo@gmail.com"}).locator('.nb-trash').click() 
    await expect(page.locator('table tr').first()).not.toHaveText("mdo@gmail.com")
})

test('Web tables', async({page}) => {
    await page.getByText("Tables & Data").click()
    await page.getByText("Smart Table").click()

    // Get the row by any text
    const targetRow = page.getByRole('row', {name: "twitter@outlook.com"}) //recommended way of getting a row, keep in mind the test must be unique for the whole table page
    await targetRow.locator('.nb-edit').click()
    await page.locator('input-editor').getByPlaceholder('Age').clear() //we need a new locator because after clicking Edit the email is not a text anymore, it is a property, so we cannot reuse the targetRow
    await page.locator('input-editor').getByPlaceholder('Age').fill('35')
    await page.locator('.nb-checkmark').click()

    // Get the row by the value of the specific column
    await page.locator('.ng2-smart-pagination-nav').getByText('2').click()
    const targetRowByID = page.getByRole('row', {name: "11"}).filter({has: page.locator('td').nth(1).getByText('11')}) 
    await targetRowByID.locator('.nb-edit').click()
    await page.locator('input-editor').getByPlaceholder('E-mail').clear()
    await page.locator('input-editor').getByPlaceholder('E-mail').fill('test@test.com')
    await page.locator('.nb-checkmark').click()
    expect(targetRowByID.locator('td').nth(5)).toHaveText('test@test.com')

    // Test table filter
    const ages = ["20", "30", "40", "200"]
    for(let age of ages){ 
        await page.locator('input-filter').getByPlaceholder('Age').clear()
        await page.locator('input-filter').getByPlaceholder('Age').fill(age)
        await page.waitForTimeout(500)
        const ageRows = page.locator('tbody tr')
        for(let row of await ageRows.all()) {
            const cellValue = await row.locator('td').last().textContent()
            if(age == "200") expect(await page.getByRole('table').textContent()).toContain("No data found")
            else expect(cellValue).toEqual(age)
        }
    }
})

test('Date pickers', async({page}) => {
    // Choose a date by hardocoded values
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()

    const calendarInputField = page.getByPlaceholder('Form Picker')
    await calendarInputField.click()

    //await page.locator('[class="day-cell ng-star-inserted"]').getByText('1', {exact: true}).click() //getByText is by default a partial match
    //await expect(calendarInputField).toHaveValue('Nov 1, 2025')

    // Choose a date according to local time
    let date = new Date() //Javascript object that manipulates time
    date.setDate(date.getDate() + 200)
    const expectedDate = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('En-US', {month: "short"})
    const expectedMonthLong = date.toLocaleString('En-US', {month: "long"})
    const expectedYear = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`
    
    let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYear} `

    while(!calendarMonthAndYear.includes(expectedMonthAndYear)) {
        await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
        calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    }

    await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, {exact: true}).click()
    await expect(calendarInputField).toHaveValue(dateToAssert)
})

test('Sliders', async({page}) => {
    // Update attribute
    const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')
    await tempGauge.evaluate(node => {
        node.setAttribute('cx', '232.630')
        node.setAttribute('cy', '232.630')
    })
    await tempGauge.click()

    // Simulate mouse movement
    const tempBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
    await tempBox.scrollIntoViewIfNeeded() //scroll down to the element so it is in the view
    const box = await tempBox.boundingBox()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x,y) //putting the mouse cursor to the given location
    await page.mouse.down() //clicking left mouse button
    await page.mouse.move(x + 100, y) //moving to the right
    await page.mouse.move(x + 100, y + 100) //moving down
    await page.mouse.up() //releasing the left mouse button
    await expect(tempBox).toContainText('30')
})