import { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#B39DDB' },
    { media: '(prefers-color-scheme: dark)', color: '#B39DDB' }
  ],
  // 強制清除快取
  colorScheme: 'light dark',
  // 強制重新渲染
  viewportFit: 'cover',
}
