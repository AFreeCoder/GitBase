import fs from 'fs';
import path from 'path';
import ResourceList from '@/components/ResourceList'


export const metadata = {
  title: 'Resources',
  description: '精选的 Claude AI 学习资源，包括官方文档、示例代码、实用工具等。',
}


export default function Resources() {
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json');
  const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));

  return (
    <div className="container mx-auto py-12">
      <ResourceList resources={resources} showMoreLink={false} />
    </div>
  )
}