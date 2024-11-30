import { NextResponse } from 'next/server';
import matter from 'gray-matter';

export const runtime = 'edge'

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const mdFolderPath = 'data/md';
const articlesJsonPath = 'data/json/articles.json';

// Base64 编码/解码函数
function base64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

function base64Decode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binString = atob(base64);
  return new TextDecoder().decode(
    new Uint8Array(binString.split('').map(char => char.charCodeAt(0)))
  );
}

async function syncArticles() {
  try {
    // 1. 获取所有 markdown 文件
    const filesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${mdFolderPath}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!filesResponse.ok) {
      throw new Error('Failed to fetch files list');
    }

    const files = await filesResponse.json();
    const mdFiles = files.filter(file => file.name.endsWith('.md'));

    // 2. 获取每个文件的内容和提交信息
    const articles = await Promise.all(
      mdFiles.map(async (file) => {
        // 2.1 获取文件内容
        const contentResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content for ${file.path}`);
        }

        const fileData = await contentResponse.json();
        const content = base64Decode(fileData.content);
        const { data: frontMatter } = matter(content);

        // 2.2 获取最后一次提交信息
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?path=${file.path}&per_page=1`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (!commitsResponse.ok) {
          throw new Error(`Failed to fetch commits for ${file.path}`);
        }

        const commits = await commitsResponse.json();
        const lastModified = commits[0]?.commit.committer.date || fileData.sha;

        return {
          title: frontMatter.title,
          description: frontMatter.description,
          date: frontMatter.date,
          lastModified,
          path: file.path,
        };
      })
    );

    // 3. 获取当前的 articles.json
    const currentFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${articlesJsonPath}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let sha;
    if (currentFileResponse.ok) {
      const currentFile = await currentFileResponse.json();
      sha = currentFile.sha;
    }

    // 4. 更新 articles.json
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${articlesJsonPath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Sync articles',
          content: base64Encode(JSON.stringify(articles, null, 2)),
          sha: sha, // 如果文件不存在，sha 将是 undefined
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update articles.json');
    }
  } catch (error) {
    console.error('Error syncing articles:', error);
    throw error;
  }
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

    // 同步文章索引
    await syncArticles();

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