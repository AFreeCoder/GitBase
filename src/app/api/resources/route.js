import { NextResponse } from 'next/server';

export const runtime = 'edge'

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const githubPath = 'data/json/resources.json';

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

async function getResourcesFromGitHub() {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }

    const data = await response.json();
    const content = base64Decode(data.content);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching resources from GitHub:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const resources = await getResourcesFromGitHub();
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req) {
  const updatedResources = await req.json();

  try {
    // Get current file to get its SHA
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current file');
    }

    const currentFile = await response.json();

    // Update file
    const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update resources',
        content: base64Encode(JSON.stringify(updatedResources, null, 2)),
        sha: currentFile.sha,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update resources');
    }

    return NextResponse.json(updatedResources);
  } catch (error) {
    console.error('Error updating resources:', error);
    return NextResponse.json({ error: 'Failed to update resources' }, { status: 500 });
  }
}