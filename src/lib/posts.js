import matter from 'gray-matter'

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const mdFolderPath = 'data/md';

async function fetchFromGitHub(path) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch from GitHub: ${path}`);
  }

  const data = await response.json();
  return {
    content: Buffer.from(data.content, 'base64').toString('utf8'),
    sha: data.sha,
  };
}

export async function getSortedPostsData() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${mdFolderPath}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posts list');
    }

    const files = await response.json();
    const mdFiles = files.filter(file => file.name.endsWith('.md'));

    const allPostsData = await Promise.all(
      mdFiles.map(async (file) => {
        const { content } = await fetchFromGitHub(file.path);
        const matterResult = matter(content);
        return {
          id: file.name.replace(/\.md$/, ''),
          ...matterResult.data,
        };
      })
    );

    // Sort posts by date
    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostData(slug) {
  try {
    const filePath = `${mdFolderPath}/${slug}.md`;
    const { content } = await fetchFromGitHub(filePath);
    const matterResult = matter(content);

    return {
      slug,
      content: matterResult.content,
      ...matterResult.data,
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    throw error;
  }
}

export async function getAllPostIds() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${mdFolderPath}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posts list');
    }

    const files = await response.json();
    return files
      .filter(file => file.name.endsWith('.md'))
      .map(file => ({
        params: {
          slug: file.name.replace(/\.md$/, ''),
        },
      }));
  } catch (error) {
    console.error('Error fetching post IDs:', error);
    return [];
  }
}