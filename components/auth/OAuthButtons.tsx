'use client';

interface Props {
  redirect?: string;
  label?: string; // 'Sign in' | 'Sign up'
}

export default function OAuthButtons({ redirect = '/', label = 'Sign in' }: Props) {
  const params = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Google */}
      <a
        href={`/api/auth/google${params}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '13px 20px',
          background: 'white',
          border: '1px solid #0A0A0F',
          color: '#0A0A0F',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f6')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
      >
        <GoogleIcon />
        {label} with Google
      </a>

      {/* Apple */}
      <a
        href={`/api/auth/apple${params}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '13px 20px',
          background: '#0A0A0F',
          border: '1px solid #0A0A0F',
          color: 'white',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <AppleIcon />
        {label} with Apple
      </a>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#E5E5EA' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#6B6B78',
          }}
        >
          or continue with email
        </span>
        <div style={{ flex: 1, height: 1, background: '#E5E5EA' }} />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="white">
      <path d="M13.173 9.545c-.017-1.8 1.469-2.668 1.537-2.712-1.058-1.545-2.703-1.755-3.284-1.779-1.395-.14-2.727.82-3.43.82-.707 0-1.793-.8-2.952-.778-1.515.023-2.914.879-3.694 2.228-1.579 2.726-.405 6.755 1.13 8.965.752 1.086 1.647 2.302 2.82 2.259 1.135-.045 1.562-.73 2.935-.73 1.37 0 1.755.73 2.953.706 1.217-.02 1.985-1.1 2.728-2.191a9.94 9.94 0 001.233-2.53c-.028-.012-2.364-.906-2.389-3.258zM10.56 3.416c.622-.754 1.042-1.8.928-2.844-.896.036-1.98.597-2.622 1.352-.577.665-1.08 1.73-.945 2.75 1.001.077 2.02-.507 2.639-1.258z" />
    </svg>
  );
}
