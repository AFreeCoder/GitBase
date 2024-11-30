import ResourceList from '@/components/ResourceList'
import { fetchAPI } from '@/lib/api'

export const runtime = 'edge'

export const metadata = {
  title: 'Resources',
  description: '精选的 Claude AI 学习资源，包括官方文档、示例代码、实用工具等。',
}

export default async function Resources() {
  try {
    const resources = await fetchAPI('/api/resources');
    return (
      <div className="container mx-auto py-12">
        <ResourceList resources={resources} showMoreLink={false} />
      </div>
    )
  } catch (error) {
    console.error('Error loading resources:', error);
    return (
      <div className="container mx-auto py-12">
        <p className="text-center text-red-500">
          加载资源时出错，请稍后再试。
        </p>
      </div>
    )
  }
}