import React from 'react';

interface ChatHeaderProps {
  chatbotName: string;
  onClose?: () => void;
  onClear?: () => void;
  primaryColor?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatbotName,
  onClose,
  onClear,
  primaryColor = '#6366f1',
}) => {
  return (
    <div className="acp-chat-header" style={{ background: primaryColor }}>
      <div className="acp-chat-header__info">
        <div className="acp-chat-header__avatar">🤖</div>
        <div>
          <div className="acp-chat-header__name">{chatbotName}</div>
          <div className="acp-chat-header__status">
            <span className="acp-online-dot" />
            Online
          </div>
        </div>
      </div>

      <div className="acp-chat-header__actions">
        {onClear && (
          <button
            className="acp-header-btn"
            onClick={onClear}
            title="Clear chat"
            aria-label="Clear chat history"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        {onClose && (
          <button
            className="acp-header-btn"
            onClick={onClose}
            title="Close chat"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
