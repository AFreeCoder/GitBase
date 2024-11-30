import ArticleList from '@/components/ArticleList'
import { fetchAPI } from '@/lib/api'

export const runtime = 'edge'

export const metadata = {
  title: 'Articles',
  description: '探索 Claude AI 的使用教程、技巧分享和最佳实践指南。',
};

export default async function Articles() {
  try {
    const articles = await fetchAPI('/api/articles');
    return (
      <div className="container mx-auto py-12">
        <ArticleList articles={articles} showMoreLink={false} />
      </div>
    )
  } catch (error) {
    console.error('Error loading articles:', error);
    return (
      <div className="container mx-auto py-12">
        <p className="text-center text-red-500">
          加载文章时出错，请稍后再试。
        </p>
      </div>
    )
  }
}

