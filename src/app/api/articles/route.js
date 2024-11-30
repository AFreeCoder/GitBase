import { NextResponse } from 'next/server';
import matter from 'gray-matter';

export const runtime = 'edge'

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const mdFolderPath = 'data/md';

// Base64 解码函数
function base64Decode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binString = atob(base64);
  return new TextDecoder().decode(
    new Uint8Array(binString.split('').map(char => char.charCodeAt(0)))
  );
}

// Base64 编码函数
function base64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  try {
    if (path) {
      // Fetch single article
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${decodeURIComponent(path)}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      const content = base64Decode(data.content);
      const { data: frontMatter, content: articleContent } = matter(content);

      return NextResponse.json({
        ...frontMatter,
        content: articleContent,
        path: data.path,
      });
    }

    // Fetch all MD files
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

    const articles = await Promise.all(mdFiles.map(async file => {
      // Fetch file content
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

      const data = await contentResponse.json();
      const content = base64Decode(data.content);
      const { data: frontMatter } = matter(content);

      // Fetch the last commit
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
      const lastModified = commits[0]?.commit.committer.date || data.sha;

      return {
        title: frontMatter.title,
        description: frontMatter.description,
        date: frontMatter.date,
        lastModified,
        path: file.path,
        id: file.name.replace(/\.md$/, ''),
      };
    }));

    // Sort articles by date
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request) {
  const { article } = await request.json();

  try {
    // Get current file to get its SHA
    const currentResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${article.path}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current file');
    }

    const currentFile = await currentResponse.json();

    const updatedContent = matter.stringify(article.content, {
      title: article.title,
      description: article.description,
      date: article.date || new Date().toISOString(),
      lastModified: new Date().toISOString(),
    });

    // Update file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${article.path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update article: ${article.title}`,
          content: base64Encode(updatedContent),
          sha: currentFile.sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update article');
    }

    return NextResponse.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}