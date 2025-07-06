import type { CustomProjectConfig } from 'lost-pixel';

const config: CustomProjectConfig = {
  browser: 'chromium',
  storybookShots: {
    storybookUrl: './storybook-static',
    // mask: [
    //   { selector: '[data-testid="timestamp"]' },
    // ],
    // breakpoints: [320, 768, 1280],
    // elementLocator: '',
    // waitForSelector: '',
  },
  threshold: 0.2,
  // mask: [
  //   { selector: '[data-testid="timestamp"]' },
  // ],
};

export default config; 