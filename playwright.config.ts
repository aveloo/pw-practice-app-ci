import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
export default defineConfig<TestOptions>({
  retries: 1,
  reporter: [
    ['json', {outputFile: 'test-results/jsonReport.json'}],
    ['junit', {outputFile: 'test-results/junitReport.xml'}],
    ['html']
    // ['allure-playwright']
  ],
  use: {
    baseURL: 'http://localhost:4200/',
    globalsQAURL: 'https://globalsqa.com/demo-site/draganddrop',
    // baseURL: process.env.DEV === "1" ? 'http://localhost:4200/' : process.env.STAGING === "1" ? "some other URL" : "another URL",
    trace: 'on-first-retry',
    video: {
      mode: "off",
      size: {
        width: 1920,
        height: 1080
      }
    }
  },

  projects: [
    // {
    //   name: 'dev',
    //   use: { 
    //     ...devices['Desktop Chrome'],
    //     baseURL: "Some different URL"
    //    }
    // },
    {
      name: 'chromium'
    },

    {
      name: 'firefox',
      use: { browserName: "firefox" },
    },
    {
      name: "pageObjectFullScreen",
      testMatch: "usePageObjects.ts",
      use: {
        viewport: {
          width: 1920,
          height: 1080
        }
      }
    },
    {
      name: "mobile",
      testMatch: 'testMobile.spec.ts',
      use: {
        ...devices['iPhone 13 Pro'] //also works with viewport
      }
    }
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:4200/"
  }
});
