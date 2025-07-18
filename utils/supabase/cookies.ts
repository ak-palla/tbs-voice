export function getCookies() {
  const cookieString = document.cookie;
  const cookies: Record<string, string> = {};

  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name) cookies[name] = value;
  });

  return cookies;
} 