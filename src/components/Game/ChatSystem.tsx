
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types/game';
import { cn } from '@/lib/utils';
import { MessageCircleIcon, SendIcon, XIcon } from 'lucide-react';

type ChatSystemProps = {
  messages: ChatMessage[];
  currentPlayerId: string | null;
  onSendMessage: (message: string) => void;
};

const ChatSystem: React.FC<ChatSystemProps> = ({ messages, currentPlayerId, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  if (!isOpen) {
    return (
      <Button 
        className="absolute left-4 bottom-20 z-50 rounded-full"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircleIcon />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
            {messages.length > 9 ? '9+' : messages.length}
          </span>
        )}
      </Button>
    );
  }
  
  return (
    <div className="absolute left-4 bottom-20 z-50 w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-lg flex flex-col">
      <div className="p-2 flex justify-between items-center border-b">
        <h3 className="font-medium">Chat</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto max-h-60">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500 text-center p-4">
            No messages yet. Say hello!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-2 rounded-lg max-w-[90%]",
                  msg.playerId === currentPlayerId
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                )}
              >
                <div className="text-xs font-medium">
                  {msg.playerId === currentPlayerId ? "You" : msg.playerName}
                </div>
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs text-right opacity-70">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-2 border-t flex">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="ml-2">
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatSystem;
