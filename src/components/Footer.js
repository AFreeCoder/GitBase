// components/Footer.js
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">关于我们</h3>
            <p className="mt-4 text-base text-gray-500">
              ClaudeHelp 是一个专注于分享 Claude AI 使用技巧和最佳实践的平台，致力于帮助用户更好地使用 Claude，发挥 AI 的潜力。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">快速链接</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-base text-gray-500 hover:text-gray-900">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-base text-gray-500 hover:text-gray-900">
                  资源
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-base text-gray-500 hover:text-gray-900">
                  文章
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">关注我们</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://claudehelp.com" target="_blank" className="text-base text-gray-500 hover:text-gray-900">
                  官网
                </a>
              </li>
              <li>
                <a href="https://github.com/afreecoder/claudehelp" target="_blank" className="text-base text-gray-500 hover:text-gray-900">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} ClaudeHelp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}