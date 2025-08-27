import * as SecureStore from "expo-secure-store";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";

export default function useChat(conversationId: number) {
  const [messages, setMessages] = useState<any[]>([]);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (!token) return;

        const response = await fetch(`${apiUrl}/messages/${conversationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const messagesArray = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        if (isMounted) setMessages(messagesArray);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    };

    fetchMessages();

    // Pusher para atualização em tempo real
    const pusher = new Pusher("local", {
      cluster: "mt1",
      wsHost: "127.0.0.1",
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
    });

    const channel = pusher.subscribe(`conversation.${conversationId}`);
    channel.bind("message.sent", (payload: any) => {
      if (payload?.message) {
        setMessages(prev => [...prev, payload.message]);
      }
    });

    return () => {
      isMounted = false;
      channel.unbind_all();
      pusher.unsubscribe(`conversation.${conversationId}`);
      pusher.disconnect();
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content,
        }),
      });

      const data = await response.json();
      const newMessage = data.data || data.message || null;
      if (newMessage) setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return { messages, sendMessage, setMessages };
}
