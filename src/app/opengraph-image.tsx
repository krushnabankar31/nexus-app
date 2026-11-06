import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Nexus — Real-Time Communities & Voice';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #090a0f 0%, #15142a 50%, #0d0f1d 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 12px 30px rgba(99, 102, 241, 0.4)',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              fontSize: '54px',
              fontWeight: 900,
              color: '#ffffff',
            }}
          >
            N
          </span>
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          Nexus
        </h1>

        <p
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#94a3b8',
            maxWidth: '800px',
            textAlign: 'center',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          The Real-Time Community Platform for Modern Teams & Creators
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
          }}
        >
          {['Real-Time Chat', 'WebRTC Voice & Video', 'Role Moderation', 'Private DMs'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
