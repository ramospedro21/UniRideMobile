import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import useChatManager from "../../hooks/useChatManager";

export default function Messages() {
  const router = useRouter();
  const { conversations, fetchConversations } = useChatManager();

  useEffect(() => { fetchConversations(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversation_id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderRadius: 12, backgroundColor: "#FFF", marginBottom: 12 }}
            onPress={() => router.push({ pathname: "/(authorized)/chat/chatDetails", params: { conversationId: item.conversation_id } })}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.other_user_name}</Text>
              {item.unread_count > 0 && (
                <View style={{ backgroundColor: "#FF3B30", borderRadius: 12, paddingHorizontal: 8 }}>
                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>{item.unread_count}</Text>
                </View>
              )}
            </View>
            <Text style={{ color: "#555", fontSize: 14, marginTop: 4 }} numberOfLines={1}>
              {item.last_message || "Nenhuma mensagem ainda"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
