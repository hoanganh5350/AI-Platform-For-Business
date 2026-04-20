import React, { useState } from 'react';
import Chatbot from '../components/Chatbot/Chatbot';
import '../styles/chatbot.css';

const DemoApp: React.FC = () => {
  const [mode, setMode] = useState<'float' | 'fullpage'>('float');
  const [color, setColor] = useState('#6366f1');
  const [lastNav, setLastNav] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID || 'demo-business';

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      gap: '24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          🤖 AI Chatbot Platform
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 8, fontSize: 16 }}>
          Enterprise AI chatbot — powered by Google Gemini
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        padding: '16px 24px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <label style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          Mode:
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'float' | 'fullpage')}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
          >
            <option value="float">Float Button</option>
            <option value="fullpage">Full Page</option>
          </select>
        </label>
        <label style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          Brand Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ cursor: 'pointer', border: 'none', borderRadius: 6, height: 28 }}
          />
        </label>
      </div>

      {/* Navigation log */}
      {lastNav && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 12,
          padding: '10px 16px',
          color: '#a5b4fc',
          fontSize: 13,
        }}>
          📍 Navigation triggered: <strong>{lastNav}</strong>
        </div>
      )}

      {/* Fullpage mode container */}
      {mode === 'fullpage' && (
        <div style={{ width: '100%', maxWidth: 800, height: 600, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <Chatbot
            apiUrl={API_URL}
            businessId={BUSINESS_ID}
            mode="fullpage"
            primaryColor={color}
            onNavigate={(nodeId) => setLastNav(nodeId)}
            onAction={(nodeId) => setLastNav(`action:${nodeId}`)}
          />
        </div>
      )}

      {/* Float mode */}
      {mode === 'float' && (
        <Chatbot
          apiUrl={API_URL}
          businessId={BUSINESS_ID}
          mode="float"
          primaryColor={color}
          defaultOpen={false}
          onNavigate={(nodeId) => setLastNav(nodeId)}
          onAction={(nodeId) => setLastNav(`action:${nodeId}`)}
        />
      )}

      {/* Instructions */}
      <div style={{ color: '#475569', fontSize: 12, textAlign: 'center', maxWidth: 500 }}>
        Make sure the backend is running at <code style={{ color: '#a5b4fc' }}>{API_URL}</code><br />
        and the business with ID <code style={{ color: '#a5b4fc' }}>{BUSINESS_ID}</code> is configured via the Admin API.
      </div>
    </div>
  );
};

export default DemoApp;
