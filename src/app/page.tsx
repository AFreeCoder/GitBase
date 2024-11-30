// pages/index.js
import ResourceList from '@/components/ResourceList'
import ArticleList from '@/components/ArticleList'
import { Metadata } from 'next'
import { fetchAPI } from '@/lib/api'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'ClaudeHelp - Claude AI 使用教程与最佳实践',
  description: '提供全面的 Claude AI 使用教程、提示词技巧、应用场景案例，帮助你更好地使用 Claude。',
}

export default async function Home() {
  try {
    const [resources, articles] = await Promise.all([
      fetchAPI('/api/resources'),
      fetchAPI('/api/articles'),
    ]);

    return (
      <div className="container mx-auto py-12 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Claude AI 教程
          </h1>
          <h2 className="text-2xl tracking-tighter sm:text-3xl md:text-3xl lg:text-3xl">使用技巧与最佳实践</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            探索 Claude AI 的无限可能。我们提供详细的使用教程、提示词技巧和实际应用案例，帮助你充分发挥 Claude 的潜力，提升工作效率。
          </p>
        </section>

        <ResourceList resources={resources} />
        <ArticleList articles={articles.slice(0, 6)} />
      </div>
    )
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="container mx-auto py-12">
        <p className="text-center text-red-500">
          加载内容时出错，请稍后再试。
        </p>
      </div>
    )
  }
}