// Shared UI components for all templates

export const FAVICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%8F%88%3C%2Ftext%3E%3C%2Fsvg%3E';

export const GITHUB_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface User {
  name: string;
  image?: string | null;
}

interface HeaderProps {
  activePage?: 'home' | 'about' | 'docs';
  user?: User;
  callbackURL?: string;
}

export function renderHeader({ activePage, user, callbackURL = '/' }: HeaderProps = {}): string {
  const userSection = user
    ? `<a href="/me" class="nav-user">
        ${user.image ? `<img src="${escapeHtml(user.image)}" alt="" class="nav-avatar">` : ''}
        <span>${escapeHtml(user.name)}</span>
      </a>`
    : `<a href="/login/github?callbackURL=${encodeURIComponent(callbackURL)}" class="nav-login">
        ${GITHUB_ICON}
        <span>Sign in</span>
      </a>`;

  return `<header class="site-header">
    <a href="/" class="site-logo">
      <span class="site-logo-icon">🏈</span>
      <span class="site-logo-text">punt.sh</span>
    </a>
    <nav class="site-nav">
      <a href="/"${activePage === 'home' ? ' class="active"' : ''}>Home</a>
      <a href="/about"${activePage === 'about' ? ' class="active"' : ''}>About</a>
      <a href="/docs"${activePage === 'docs' ? ' class="active"' : ''}>Docs</a>
      ${userSection}
    </nav>
  </header>`;
}

export function renderFooter(): string {
  // Vercel Analytics - only works on Vercel deployments, safely ignored on self-hosted
  return `<footer class="site-footer">
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
  <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
  <script defer src="/_vercel/insights/script.js"></script>`;
}

export function getSharedStyles(): string {
  return `
    /* Custom scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #11111b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: #45475a;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #585b70;
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: #45475a #11111b;
    }

    /* Shared header styles */
    .site-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #313244;
      background: rgba(17, 17, 27, 0.5);
      line-height: 1;
    }

    .site-logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }

    .site-logo:hover {
      color: #b4befe;
    }

    .site-logo-icon {
      font-size: 24px;
    }

    .site-nav {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .site-nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .site-nav a:hover {
      color: #cdd6f4;
    }

    .site-nav a.active {
      color: #89b4fa;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #313244;
      border-radius: 6px;
      color: #a6e3a1 !important;
    }

    .nav-user:hover {
      background: #45475a;
    }

    .nav-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .nav-login {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-login svg {
      opacity: 0.8;
    }

    /* Shared footer styles */
    .site-footer {
      padding: 24px;
      text-align: center;
      border-top: 1px solid #313244;
      color: #6c7086;
      font-size: 13px;
      font-family: system-ui, sans-serif;
    }

    .site-footer a {
      color: #89b4fa;
      text-decoration: none;
    }

    .site-footer a:hover {
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .site-header {
        padding: 12px 16px;
        gap: 12px;
      }

      .site-logo {
        font-size: 16px;
      }

      .site-logo-icon {
        font-size: 20px;
      }

      .site-nav {
        gap: 8px;
      }

      .site-nav a {
        font-size: 13px;
        min-height: 44px;
        display: flex;
        align-items: center;
        padding: 0 8px;
      }

      .nav-user {
        padding: 8px 12px;
        min-height: 44px;
      }

      .nav-avatar {
        width: 18px;
        height: 18px;
      }

      .site-footer {
        padding: 16px;
        font-size: 12px;
      }
    }
  `;
}
