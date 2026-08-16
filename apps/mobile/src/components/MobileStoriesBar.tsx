import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Plus } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { MobileStoryViewer } from "./MobileStoryViewer";

interface MobileStoriesBarProps {
  groups: any[];
  onPlaceSelect?: (placeId: string) => void;
}

export function MobileStoriesBar({ groups, onPlaceSelect }: MobileStoriesBarProps) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Кнопка "Добавить историю" */}
        <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
          <View style={styles.addStoryCircle}>
            <Plus size={22} color={COLORS.amber} />
          </View>
          <Text style={styles.authorName}>История</Text>
        </TouchableOpacity>

        {/* Кружочки историй */}
        {groups.map((group, index) => {
          const author = group.author;
          return (
            <TouchableOpacity
              key={author.id || index}
              style={styles.storyItem}
              onPress={() => setActiveGroupIndex(index)}
              activeOpacity={0.8}
            >
              <View style={styles.storyRing}>
                <Image
                  source={{
                    uri:
                      author.avatarUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                  }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.authorName} numberOfLines={1}>
                {author.name.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Модальное окно просмотра сторис */}
      {activeGroupIndex !== null && (
        <MobileStoryViewer
          groups={groups}
          initialGroupIndex={activeGroupIndex}
          onClose={() => setActiveGroupIndex(null)}
          onPlaceSelect={(placeId) => {
            setActiveGroupIndex(null);
            onPlaceSelect?.(placeId);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14
  },
  storyItem: {
    alignItems: "center",
    width: 64
  },
  addStoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(245, 158, 11, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.amber,
    padding: 2,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26
  },
  authorName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center"
  }
});
