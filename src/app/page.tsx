// pages/index.js
import fs from 'fs'
import path from 'path'
import { getSortedPostsData } from '@/lib/posts'
import ResourceList from '@/components/ResourceList'
import ArticleList from '@/components/ArticleList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClaudeHelp - Claude AI 使用教程与最佳实践',
  description: '提供全面的 Claude AI 使用教程、提示词技巧、应用场景案例，帮助你更好地使用 Claude。',
}

export default function Home() {
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json')
  const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'))
  const allPostsData = getSortedPostsData().slice(0, 6)

  return (
    <div className="container mx-auto py-12 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          ClaudeHelp
        </h1>
        <h2 className="text-2xl tracking-tighter sm:text-3xl md:text-3xl lg:text-3xl">Claude AI 使用教程与最佳实践</h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
          ClaudeHelp 是一个专注于分享 Claude AI 使用技巧和最佳实践的平台。我们提供详细的教程、提示词技巧和实际应用案例，帮助你更好地发挥 Claude 的潜力。
        </p>
      </section>

      <ResourceList resources={resources} />
      <ArticleList articles={allPostsData} />
    </div>
  )
}