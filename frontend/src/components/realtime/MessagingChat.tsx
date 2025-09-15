'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Search, 
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api.service';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online: boolean;
}

export default function MessagingChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchConversations();
      setupWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getConversations();
      setConversations(response.conversations || []);
    } catch (error: any) {
      // Silently handle 404 errors as the endpoint may not be implemented yet
      if (error?.response?.status !== 404) {
        console.error('Error fetching conversations:', error);
      }
      // Set empty conversations for now
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await ApiService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupWebSocket = () => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to messaging service');
      socket.emit('join', { userId: user.id });
    });

    socket.on('message', (message: Message) => {
      console.log('New message received:', message);
      
      // Add message to current conversation
      if (selectedConversation && 
          (message.senderId === selectedConversation.participantId || 
           message.receiverId === selectedConversation.participantId)) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read if it's for the current user
        if (message.receiverId === user.id) {
          socket.emit('markAsRead', { messageId: message.id });
        }
      }

      // Update conversation list
      updateConversationWithNewMessage(message);
    });

    socket.on('typing', ({ userId, isTyping }) => {
      if (selectedConversation?.participantId === userId) {
        setTyping(isTyping);
      }
    });

    socket.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users);
      // Update conversation online status
      setConversations(prev => prev.map(conv => ({
        ...conv,
        online: users.includes(conv.participantId)
      })));
    });

    socket.on('messageRead', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from messaging service');
    });
  };

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations(prev => {
      const updated = [...prev];
      const convIndex = updated.findIndex(c => 
        c.participantId === message.senderId || c.participantId === message.receiverId
      );
      
      if (convIndex !== -1) {
        updated[convIndex].lastMessage = message.content;
        updated[convIndex].lastMessageTime = message.createdAt;
        if (message.receiverId === user?.id && !message.read) {
          updated[convIndex].unreadCount++;
        }
        // Move to top
        updated.unshift(updated.splice(convIndex, 1)[0]);
      }
      
      return updated;
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socketRef.current) return;

    const messageData = {
      content: newMessage,
      receiverId: selectedConversation.participantId,
      type: 'text' as const,
    };

    try {
      // Send via socket for real-time
      socketRef.current.emit('sendMessage', messageData);
      
      // Also save to database
      await ApiService.sendMessage(messageData);
      
      // Add to local messages immediately
      const tempMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: user!.id,
        senderName: user!.firstName + ' ' + user!.lastName,
        receiverId: selectedConversation.participantId,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'text',
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Update conversation list
      updateConversationWithNewMessage(tempMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || !selectedConversation) return;

    socketRef.current.emit('typing', { 
      receiverId: selectedConversation.participantId, 
      isTyping: true 
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { 
        receiverId: selectedConversation.participantId, 
        isTyping: false 
      });
    }, 1000);
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    
    // Mark all messages as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => prev.map(c => 
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-colors z-40"
      >
        <MessageSquare className="h-6 w-6" />
        {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-neutral-200 z-50 flex flex-col">
          {!selectedConversation ? (
            // Conversation List View
            <>
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-neutral-900">Messages</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-neutral-600">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-600">No conversations yet</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Start a conversation with someone
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => selectConversation(conversation)}
                        className="p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {conversation.participantName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {conversation.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-neutral-900">
                                {conversation.participantName}
                              </p>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-neutral-500">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mb-1">
                              {conversation.participantRole}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-sm text-neutral-600 truncate">
                                {conversation.lastMessage}
                              </p>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Chat View
            <>
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">
                          {selectedConversation.participantName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {selectedConversation.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {selectedConversation.participantName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {selectedConversation.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <button className="text-neutral-500 hover:text-neutral-700">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                {typing && (
                  <div className="text-xs text-neutral-500 mt-2">
                    {selectedConversation.participantName} is typing...
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-white'
                            : 'bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-xs ${
                            isOwnMessage ? 'text-white/70' : 'text-neutral-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwnMessage && (
                            message.read ? (
                              <CheckCheck className="h-3 w-3 text-white/70" />
                            ) : (
                              <Check className="h-3 w-3 text-white/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <button className="text-neutral-500 hover:text-neutral-700">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="text-neutral-500 hover:text-neutral-700">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}