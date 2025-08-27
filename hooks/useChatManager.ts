import { useAuthSession } from "@/providers/AuthProvider";
import * as SecureStore from "expo-secure-store";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";

export default function useChatManager() {
  const { user } = useAuthSession();
  const userId = user?.id || null;

  const [conversations, setConversations] = useState<any[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<number, any[]>>({});
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher("local", {
      cluster: "mt1",
      wsHost: "127.0.0.1",
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
    });
    pusherRef.current = pusher;

    return () => {
      pusher.unbind_all();
      pusher.disconnect();
    };
  }, [userId]);

  const fetchConversations = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/conversations`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      setConversations(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
    }
  };

  const getMessages = (conversationId: number) => messagesMap[conversationId] || [];

  const fetchMessages = async (conversationId: number) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      const msgs = Array.isArray(data.data) ? data.data : [];
      setMessagesMap(prev => ({ ...prev, [conversationId]: msgs }));
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  };

  const sendMessage = async (conversationId: number, content: string) => {
    if (!content.trim()) return;
    const token = await SecureStore.getItemAsync("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      });
      const data = await res.json();
      const newMsg = data.data || data.message;
      if (newMsg) {
        setMessagesMap(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), newMsg],
        }));
        setConversations(prev =>
          prev.map(conv =>
            conv.conversation_id === conversationId
              ? { ...conv, last_message: newMsg.content, unread_count: 0 }
              : conv
          )
        );
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const markAsRead = async (conversationId: number) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (!token) return;

    try {
      await fetch(`${apiUrl}/messages/${conversationId}/mark-as-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setMessagesMap(prev => {
        const updated = prev[conversationId]?.map(msg => ({ ...msg, read: true }));
        return { ...prev, [conversationId]: updated || [] };
      });
      setConversations(prev =>
        prev.map(conv =>
          conv.conversation_id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Erro ao marcar como lidas:", err);
    }
  };

  const subscribeConversation = (conversationId: number) => {
    if (!pusherRef.current) return;
    const channel = pusherRef.current.subscribe(`conversation.${conversationId}`);
    channel.bind("message.sent", (payload: any) => {
      const msg = payload.message;
      if (!msg) return;

      setMessagesMap(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), msg],
      }));

      setConversations(prev =>
        prev.map(conv => {
          if (conv.conversation_id === conversationId) {
            const count = msg.sender_id !== userId ? (conv.unread_count || 0) + 1 : conv.unread_count;
            return { ...conv, last_message: msg.content, unread_count: count };
          }
          return conv;
        })
      );
    });
  };

  return {
    conversations,
    fetchConversations,
    getMessages,
    fetchMessages,
    sendMessage,
    markAsRead,
    subscribeConversation,
  };
}
