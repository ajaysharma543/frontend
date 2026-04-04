// ChatContext.jsx
import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messagesMap, setMessagesMap] = useState({});

  return (
    <ChatContext.Provider value={{ messagesMap, setMessagesMap }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
