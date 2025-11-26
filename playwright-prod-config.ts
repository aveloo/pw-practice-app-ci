import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
export default defineConfig<TestOptions>({
  use: {
    baseURL: 'http://localhost:4200/',
    globalsQAURL: 'https://globalsqa.com/demo-site/draganddrop'
  },

  projects: [
    {
      name: 'chromium'
    }
  ]
});
