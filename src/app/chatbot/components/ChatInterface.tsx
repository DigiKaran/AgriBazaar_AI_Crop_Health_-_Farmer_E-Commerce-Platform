
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { saveChatMessageAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Generate a session ID when the component mounts or when the user logs in/out
    if (currentUser) {
      setSessionId(`${currentUser.uid}-${Date.now()}`);
    } else {
      setSessionId(`guest-${Date.now()}`);
    }
    // For now, we are not loading chat history. This would be the place to do it.
    // Example: if (currentUser && sessionId) loadChatHistory(currentUser.uid, sessionId);
  }, [currentUser]);


  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);
  
  useEffect(() => {
    // Initial bot message
    setMessages([
      { 
        id: Date.now().toString(), 
        text: "Namaste! I'm AgriBot, your AI farming assistant for India. How can I help you today?", 
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSaveMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentUser) {
      // Silently fail or show a subtle indicator if user is not logged in.
      // For now, we won't save messages for guests.
      return;
    }
    if (!sessionId) {
      console.warn("Chat session ID not available, cannot save message.");
      return;
    }

    try {
      await saveChatMessageAction({
        userId: currentUser.uid,
        sessionId: sessionId,
        text: message.text,
        sender: message.sender,
      });
    } catch (error) {
      console.error("Failed to save chat message:", error);
      // Optionally show a toast, but might be too noisy for every message.
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to chat with AgriBot.",
      });
      return;
    }

    const userMessageData = {
      text: inputValue,
      sender: 'user' as 'user',
    };
    const userMessage: Message = {
      ...userMessageData,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    await handleSaveMessage(userMessageData);

    // Mock bot response - In a real app, this would call your Genkit flow
    setTimeout(async () => {
      const botResponseData = {
         text: `Thank you for your message: "${userMessage.text}". I'm here to assist with queries related to Indian agriculture. For complex issues, please consult a local expert.`,
         sender: 'bot' as 'bot',
      };
      const botResponse: Message = {
        ...botResponseData,
        id: (Date.now() + 1).toString(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      await handleSaveMessage(botResponseData);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] w-full bg-card border rounded-xl shadow-xl overflow-hidden">
      {!currentUser && (
         <Alert variant="destructive" className="m-4 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Login to Chat</AlertTitle>
            <AlertDescription>
              Please log in to save your chat history and get personalized assistance.
            </AlertDescription>
          </Alert>
      )}
      <ScrollArea className="flex-grow p-4 sm:p-6 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2 max-w-[85%] sm:max-w-[75%]",
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={msg.sender === 'user' ? currentUser?.photoURL || undefined : "https://placehold.co/40x40.png?text=AI"} />
              <AvatarFallback className={cn(msg.sender === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground')}>
                {msg.sender === 'user' ? <User size={18}/> : <Bot size={18}/>}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm shadow",
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-secondary-foreground rounded-bl-none'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={cn(
                  "text-xs mt-1",
                  msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-secondary-foreground/70 text-left'
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 max-w-[75%] mr-auto">
            <Avatar className="h-8 w-8">
               <AvatarImage src="https://placehold.co/40x40.png?text=AI" />
               <AvatarFallback className='bg-primary text-primary-foreground'><Bot size={18}/></AvatarFallback>
            </Avatar>
            <div className="rounded-lg px-3 py-2 text-sm shadow bg-secondary text-secondary-foreground rounded-bl-none">
              <div className="flex space-x-1">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-4 bg-background">
        <Input
          type="text"
          placeholder={currentUser ? "Type your message..." : "Please log in to chat"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow"
          disabled={isLoading || !currentUser}
        />
        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim() || !currentUser} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
