import { NextResponse } from 'next/server';
import matter from 'gray-matter';

export const runtime = 'edge'

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const mdFolderPath = 'data/md';

// Base64 编码函数
function base64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

export async function POST(request) {
  try {
    const { title, content, description } = await request.json();

    // 创建文件名（使用标题的 slug 版本）
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const fileName = `${slug}.md`;
    const filePath = `${mdFolderPath}/${fileName}`;

    // 创建 frontmatter
    const fileContent = matter.stringify(content, {
      title,
      description,
      date: new Date().toISOString(),
    });

    // 创建文件
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Create article: ${title}`,
          content: base64Encode(fileContent),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        path: data.content.path,
        sha: data.content.sha,
      },
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}