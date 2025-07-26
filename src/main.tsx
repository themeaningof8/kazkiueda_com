import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Buffer polyfill for gray-matter
import { Buffer } from 'buffer'
// @ts-ignore
window.Buffer = Buffer
// @ts-ignore
globalThis.Buffer = Buffer

import App from './App'
import './styles/globals.css'

// 開発環境でMSWを有効にする（E2Eテスト時は除く）
async function enableMocking() {
  // E2Eテスト時やプロダクション環境ではMSWを無効にする
  if (
    process.env['NODE_ENV'] !== 'development' ||
    process.env['E2E_TEST'] === 'true' ||
    window.location.search.includes('e2e-test')
  ) {
    return
  }

  try {
    const { worker } = await import('./mocks/browser')

    // MSWワーカーを開始
    return worker.start({
      onUnhandledRequest: 'bypass',
    })
  } catch (error) {
    console.error('Failed to import MSW:', error)
    return
  }
}

// MSWの初期化に関係なくアプリケーションを起動
async function startApp() {
  try {
    await enableMocking()
  } catch (error) {
    console.error('MSW initialization failed:', error)
  } finally {
    // MSWの状態に関係なくアプリケーションを起動
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  }
}

startApp()
