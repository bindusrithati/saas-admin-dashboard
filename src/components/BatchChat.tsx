import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { wsService } from '../services/websocket';
import { ChatMessage } from '../types';

interface BatchChatProps {
  batchId: number;
}

const BatchChat: React.FC<BatchChatProps> = ({ batchId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Connect to WebSocket
    wsService.connect(batchId, token);

    // Handle incoming messages
    wsService.onMessage((message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Handle connection status
    wsService.onConnect(() => {
      setConnected(true);
      setError('');
    });

    wsService.onDisconnect(() => {
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, [batchId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    wsService.sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'mentor':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 500 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">Batch Chat</Typography>
        <Chip
          label={connected ? 'Connected' : 'Disconnected'}
          color={connected ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_id === user?.id;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {!isOwnMessage && (
                  <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>
                    {getInitials(msg.user_name)}
                  </Avatar>
                )}
                <Paper
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                    color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  {!isOwnMessage && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {msg.user_name}
                      </Typography>
                      <Chip
                        label={msg.user_role}
                        size="small"
                        color={getRoleColor(msg.user_role) as any}
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    </Box>
                  )}
                  <Typography variant="body2">{msg.message}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Paper>
                {isOwnMessage && (
                  <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>
                    {getInitials(user?.name || '')}
                  </Avatar>
                )}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!connected}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!connected || !newMessage.trim()}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
            '&:disabled': { backgroundColor: 'grey.300' },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default BatchChat;
