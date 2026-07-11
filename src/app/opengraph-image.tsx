import { ImageResponse } from 'next/og';

export const alt = 'StudyVault - Reimagined Knowledge & Study Companion';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Glow effects in background */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.15)',
            filter: 'blur(120px)',
          }}
        />

        {/* Center Panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(24, 24, 27, 0.6)',
            border: '1px solid rgba(63, 63, 70, 0.4)',
            borderRadius: '32px',
            padding: '60px 80px',
            width: '900px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo Group */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '24px',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '64px',
                fontWeight: '900',
                color: 'white',
                letterSpacing: '-1.5px',
              }}
            >
              StudyVault
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '28px',
              color: '#d4d4d8',
              textAlign: 'center',
              marginBottom: '40px',
              maxWidth: '650px',
              fontWeight: '500',
              lineHeight: '1.4',
            }}
          >
            Organise markdown notes, master active recall flashcards, and coordinate tasks in a beautiful obsidian-dark vault.
          </div>

          {/* Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '9999px',
                padding: '8px 20px',
                color: '#818cf8',
                fontSize: '18px',
                fontWeight: 'bold',
                marginRight: '16px',
              }}
            >
              📝 Notes Vault
            </div>
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '9999px',
                padding: '8px 20px',
                color: '#c084fc',
                fontSize: '18px',
                fontWeight: 'bold',
                marginRight: '16px',
              }}
            >
              🧠 Spaced Repetition
            </div>
            <div
              style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '9999px',
                padding: '8px 20px',
                color: '#fbbf24',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              📋 Kanban Board
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
