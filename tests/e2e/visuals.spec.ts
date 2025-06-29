import { test, expect } from '@playwright/test'

test.describe('Visual Regression Testing for Components', () => {
  test('Button component variants', async ({ page }) => {
    // コンポーネントテスト用の特別なURLにアクセス
    await page.goto('/#@/tests/e2e/components/button.html')

    // ページ全体のスクリーンショットを撮影
    await expect(page).toHaveScreenshot('button-variants.png')
  })

  test('Card component variants', async ({ page }) => {
    // コンポーネントテスト用の特別なURLにアクセス
    await page.goto('/#@/tests/e2e/components/card.html')

    // ページ全体のスクリーンショットを撮影
    await expect(page).toHaveScreenshot('card-variants.png')
  })

  test('Accordion component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/accordion.html')
    // アニメーションが完了するのを待つため、少し待機時間を設ける
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('accordion.png')
  })

  test('Alert component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/alert.html')
    await expect(page).toHaveScreenshot('alert.png')
  })

  test('AlertDialog component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/alert-dialog.html')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('alert-dialog.png')
  })

  test('AspectRatio component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/aspect-ratio.html')
    await expect(page).toHaveScreenshot('aspect-ratio.png')
  })

  test('Avatar component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/avatar.html')
    await expect(page).toHaveScreenshot('avatar.png')
  })

  test('Badge component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/badge.html')
    await expect(page).toHaveScreenshot('badge.png')
  })

  test('Breadcrumb component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/breadcrumb.html')
    await expect(page).toHaveScreenshot('breadcrumb.png')
  })

  test('Calendar component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/calendar.html')
    await expect(page).toHaveScreenshot('calendar.png')
  })

  test('Carousel component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/carousel.html')
    await expect(page).toHaveScreenshot('carousel.png')
  })

  test('Checkbox component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/checkbox.html')
    await expect(page).toHaveScreenshot('checkbox.png')
  })

  test('Collapsible component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/collapsible.html')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('collapsible.png')
  })

  test('Command component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/command.html')
    await expect(page).toHaveScreenshot('command.png')
  })

  test('ContextMenu component trigger', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/context-menu.html')
    await expect(page).toHaveScreenshot('context-menu-trigger.png')
  })

  test('Dialog component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/dialog.html')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('dialog.png')
  })

  test('Drawer component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/drawer.html')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('drawer.png')
  })

  test('DropdownMenu component trigger', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/dropdown-menu.html')
    await expect(page).toHaveScreenshot('dropdown-menu-trigger.png')
  })

  test('HoverCard component trigger', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/hover-card.html')
    await expect(page).toHaveScreenshot('hover-card-trigger.png')
  })

  test('Input component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/input.html')
    await expect(page).toHaveScreenshot('input.png')
  })

  test('InputOTP component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/input-otp.html')
    await expect(page).toHaveScreenshot('input-otp.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Label component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/label.html')
    await expect(page).toHaveScreenshot('label.png')
  })

  test('Menubar component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/menubar.html')
    await expect(page).toHaveScreenshot('menubar.png')
  })

  test('NavigationMenu component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/navigation-menu.html')
    await expect(page).toHaveScreenshot('navigation-menu.png')
  })

  test('Pagination component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/pagination.html')
    await expect(page).toHaveScreenshot('pagination.png')
  })

  test('Popover component trigger', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/popover.html')
    await expect(page).toHaveScreenshot('popover-trigger.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Progress component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/progress.html')
    await expect(page).toHaveScreenshot('progress.png')
  })

  test('RadioGroup component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/radio-group.html')
    await expect(page).toHaveScreenshot('radio-group.png')
  })

  test('Resizable component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/resizable.html')
    await expect(page).toHaveScreenshot('resizable.png')
  })

  test('ScrollArea component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/scroll-area.html')
    await expect(page).toHaveScreenshot('scroll-area.png')
  })

  test('Select component trigger', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/select.html')
    await expect(page).toHaveScreenshot('select-trigger.png')
  })

  test('Separator component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/separator.html')
    await expect(page).toHaveScreenshot('separator.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Sheet component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/sheet.html')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('sheet.png')
  })

  test('Skeleton component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/skeleton.html')
    await expect(page).toHaveScreenshot('skeleton.png')
  })

  test('Slider component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/slider.html')
    await expect(page).toHaveScreenshot('slider.png')
  })

  test('Sonner component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/sonner.html')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('sonner.png')
  })

  test('Switch component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/switch.html')
    await expect(page).toHaveScreenshot('switch.png')
  })

  test('Table component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/table.html')
    await expect(page).toHaveScreenshot('table.png')
  })

  test('Tabs component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/tabs.html')
    await expect(page).toHaveScreenshot('tabs.png')
  })

  test('Textarea component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/textarea.html')
    await expect(page).toHaveScreenshot('textarea.png')
  })

  test('Toggle component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/toggle.html')
    await expect(page).toHaveScreenshot('toggle.png')
  })

  test('ToggleGroup component', async ({ page }) => {
    await page.goto('/#@/tests/e2e/components/toggle-group.html')
    await expect(page).toHaveScreenshot('toggle-group.png')
  })
}) 