import { useAuthSession } from "@/providers/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, View } from "react-native";
import useChatManager from "../../../hooks/useChatManager";

export default function ChatDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params?.conversationId ? Number(params.conversationId) : null;
  const { user } = useAuthSession();

  const flatListRef = useRef<FlatList>(null);
  const [newMessage, setNewMessage] = useState("");
  const { getMessages, fetchMessages, sendMessage, markAsRead, subscribeConversation } = useChatManager();
  const messages = conversationId ? getMessages(conversationId) : [];

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
      subscribeConversation(conversationId);
    }
  }, [conversationId]);

  const handleSend = async () => {
    if (!conversationId || !newMessage.trim()) return;
    await sendMessage(conversationId, newMessage);
    setNewMessage("");
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  if (!conversationId) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderRadius: 12, marginVertical: 4, maxWidth: "75%", alignSelf: item.sender_id === user?.id ? "flex-end" : "flex-start", backgroundColor: item.sender_id === user?.id ? "#DCF8C6" : "#FFF" }}>
              <Text>{item.content}</Text>
              <Text style={{ fontSize: 10, color: "#888", marginTop: 2, alignSelf: "flex-end" }}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={{ flexDirection: "row", padding: 12, borderTopWidth: 1, borderTopColor: "#DDD", backgroundColor: "#FFF" }}>
          <TextInput style={{ flex: 1, borderWidth: 1, borderColor: "#CCC", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 }}
            placeholder="Escreva uma mensagem..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Button title="Enviar" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
