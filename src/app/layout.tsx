import './globals.css'
import { Inter } from 'next/font/google'
import { Layout } from '@/components/Layout'
import { Metadata } from 'next'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ClaudeHelp',
    template: '%s | ClaudeHelp'
  },
  description: 'Claude AI 使用教程和最佳实践分享平台，帮助你更好地使用 Claude',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <head>
        <Script 
          defer
          data-domain="claudehelp.com"
          src="https://app.pageview.app/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-MFH40S2FRF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-MFH40S2FRF');
          `}
        </Script>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}