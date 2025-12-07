import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Conversation, Message } from '@/lib/types';
import { MessagesService } from '@/lib/firestore-service';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newConversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(newConversations);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to conversations:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { conversations, loading };
}

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (text: string, senderId: string) => {
    if (!conversationId) return;
    await MessagesService.sendMessage(conversationId, {
      conversationId,
      senderId,
      text
    });
  };

  return { messages, loading, sendMessage };
}
