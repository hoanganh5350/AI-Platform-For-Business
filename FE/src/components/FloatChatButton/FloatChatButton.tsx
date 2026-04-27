import React from 'react';
import { FloatButton } from 'antd';

interface FloatChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  primaryColor?: string;
  unreadCount?: number;
}

const FloatChatButton: React.FC<FloatChatButtonProps> = ({
  isOpen,
  onClick,
  primaryColor = '#6366f1',
  unreadCount = 0,
}) => {
  return (
    <div className="acp-float-btn-wrapper">
      {unreadCount > 0 && !isOpen && (
        <span className="acp-unread-badge" style={{ background: '#ef4444' }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      <FloatButton
        icon={
          isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
            </svg>
          )
        }
        style={{ background: primaryColor, color: '#fff', width: 50, height: 50, fontSize: 22 }}
        onClick={onClick}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="acp-float-btn"
      />
    </div>
  );
};

export default FloatChatButton;
