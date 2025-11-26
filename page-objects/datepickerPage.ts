import { Locator, Page } from "@playwright/test";
import { test, expect } from '@playwright/test'
import { HelperBase } from "./helperBase";

export class DatepickerPage extends HelperBase{
    constructor(page: Page) {
        super(page)
    }
    async selectCommonDatePickerDateFromToday(numberOfDaysFromToday: number) {
        const calendarInputField = this.page.getByPlaceholder('Form Picker')
        await calendarInputField.click()
        const dateToAssert = await this.selectDateInTheCalendar(numberOfDaysFromToday)
        await expect(calendarInputField).toHaveValue(dateToAssert)
    }

    async selectDatePickerWithRangeFromToday(startDayFromToday: number, endDayFromToday: number) {
        const calendarInputField = this.page.getByPlaceholder('Range Picker')
        await calendarInputField.click()
        const dateToAssertStart = await this.selectDateInTheCalendar(startDayFromToday)
        const dateToAssertEnd = await this.selectDateInTheCalendar(endDayFromToday)
        const dateToAssert = `${dateToAssertStart} - ${dateToAssertEnd}`
        await expect(calendarInputField).toHaveValue(dateToAssert)
    }

    private async selectDateInTheCalendar(numberOfDaysFromToday: number) {
        let date = new Date()
        date.setDate(date.getDate() + numberOfDaysFromToday)
        const expectedDate = date.getDate().toString()
        const expectedMonthShort = date.toLocaleString('En-US', {month: 'short'})
        const expectedMonthLong = date.toLocaleString('En-US', {month: 'long'})
        const expectedYear = date.getFullYear()
        const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`
    
        let calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
        const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYear}`
    
        if(numberOfDaysFromToday > 0){
            while(!calendarMonthAndYear.includes(expectedMonthAndYear)){
                await this.page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
                calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
            } 
        } 
        else {
            while(!calendarMonthAndYear.includes(expectedMonthAndYear)){
                await this.page.locator('nb-calendar-pageable-navigation [data-name="chevron-left"]').click()
                calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
            } 
        }
 
    await this.page.locator('.day-cell.ng-star-inserted:not(.bounding-month)').getByText(expectedDate, {exact: true}).click()
    return dateToAssert
    }
}