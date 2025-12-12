import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Check, CheckCheck, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useConversations, useChatMessages } from "@/hooks/use-chat";
import { MessagesService } from "@/lib/firestore-service";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { conversations, loading: loadingConversations } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { messages, loading: loadingMessages, sendMessage } = useChatMessages(activeConversationId);
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle new chat from query params
  useEffect(() => {
    const initChat = async () => {
      const sellerId = searchParams.get("seller");
      const productId = searchParams.get("product");

      if (!user || !sellerId || sellerId === user.uid || loadingConversations) return;

      // Check if conversation already exists
      const existingConv = conversations.find(c => 
        c.participantIds.includes(sellerId) && c.participantIds.includes(user.uid)
      );

      if (existingConv) {
        setActiveConversationId(existingConv.id);
      } else {
        // Create new conversation
        try {
          // Fetch seller info (optional, but good for UI immediately)
          // For now, we rely on the service creating it.
          
          const newConvId = await MessagesService.createConversation({
            participantIds: [user.uid, sellerId],
            participants: {
              [user.uid]: {
                name: user.name || "Eu",
                avatar: user.photoURL || ""
              },
              [sellerId]: {
                name: "Vendedor", // Will be updated when they reply or we fetch profile
                avatar: ""
              }
            },
            lastMessage: {
              text: productId ? "Olá! Estou interessado neste artigo." : "Olá!",
              senderId: user.uid,
              createdAt: new Date() as any, // Firestore timestamp will be set by service
              read: false
            },
            unreadCount: {
              [sellerId]: 1,
              [user.uid]: 0
            }
          });
          
          setActiveConversationId(newConvId);
        } catch (error) {
          console.error("Error creating conversation:", error);
        }
      }
    };

    initChat();
  }, [searchParams, user, conversations, loadingConversations]);

  // Set first conversation as active if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && !searchParams.get("seller")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, searchParams]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle resize for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user?.uid) return;

    await sendMessage(messageInput, user.uid);
    setMessageInput("");
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipantId = activeConversation?.participantIds.find(id => id !== user?.uid);
  const otherParticipant = otherParticipantId ? activeConversation?.participants[otherParticipantId] : null;

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] bg-background overflow-hidden border rounded-2xl shadow-sm">
      {/* Sidebar - Conversations List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r border-border/40 flex flex-col bg-background transition-all duration-300",
        activeConversation && isMobileView ? "hidden" : "flex"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border/40">
          <h1 className="font-serif text-2xl mb-4">Mensagens</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar conversas..." 
              className="pl-9 bg-secondary/20 border-transparent focus:bg-background transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 gap-1">
            {conversations.map((conv) => {
              const otherId = conv.participantIds.find(id => id !== user?.uid);
              const otherUser = otherId ? conv.participants[otherId] : { name: 'Unknown', avatar: '' };
              const isActive = activeConversationId === conv.id;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                    isActive 
                      ? "bg-secondary/40" 
                      : "hover:bg-secondary/20"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-border/50">
                      <AvatarImage src={otherUser.avatar} />
                      <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium truncate">{otherUser.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {conv.lastMessage?.createdAt ? formatDistanceToNow(conv.lastMessage.createdAt.toDate(), { locale: pt }) : ''}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm truncate text-muted-foreground"
                    )}>
                      {conv.lastMessage?.text || 'Inicie a conversa'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#F9F8F4]/50 transition-all duration-300",
        !activeConversationId && isMobileView ? "hidden" : "flex"
      )}>
        {activeConversationId && otherParticipant ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)} className="-ml-2">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={otherParticipant.avatar} />
                  <AvatarFallback>{otherParticipant.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium leading-none">{otherParticipant.name}</h2>
                  <span className="text-xs text-muted-foreground">
                    Online agora
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex w-full",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[75%] md:max-w-[60%] px-4 py-2.5 shadow-sm relative group",
                        isMe 
                          ? "bg-emerald-100/80 text-emerald-900 rounded-2xl rounded-tr-sm" 
                          : "bg-white text-foreground rounded-2xl rounded-tl-sm border border-border/20"
                      )}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          isMe ? "text-emerald-700/70" : "text-muted-foreground/70"
                        )}>
                          <span className="text-[10px]">
                            {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { locale: pt }) : 'Enviando...'}
                          </span>
                          {isMe && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border/40">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground mb-0.5">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Escreva uma mensagem..." 
                    className="min-h-[44px] py-3 bg-secondary/20 border-transparent focus:bg-background rounded-xl pr-10 resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "h-11 w-11 rounded-xl transition-all duration-300 shadow-md",
                    messageInput.trim() ? "bg-primary hover:bg-primary/90" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
              <Send className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-2">Suas Mensagens</h3>
            <p className="max-w-xs">Selecione uma conversa para começar a negociar ou tirar dúvidas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
