export async function fetchAPI(endpoint: string) {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const domain = process.env.DOMAIN || 'localhost:3000';
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${protocol}://${domain}${cleanEndpoint}`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${endpoint}`);
  }

  return response.json();
} 