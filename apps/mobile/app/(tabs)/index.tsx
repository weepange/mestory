import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { PLACE_CATEGORIES, Place, PlaceCategoryId } from "@mestory/shared";
import { COLORS } from "../../src/theme/colors";
import { mobileApi } from "../../src/api/client";
import { MobileStoriesBar } from "../../src/components/MobileStoriesBar";
import { MobilePlaceCard } from "../../src/components/MobilePlaceCard";
import { MobilePlaceDetailModal } from "../../src/components/MobilePlaceDetailModal";

export default function FeedScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [storiesGroups, setStoriesGroups] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [placesRes, storiesRes] = await Promise.all([
        mobileApi.getPlaces("rostov-on-don", selectedCategory),
        mobileApi.getStories("rostov-on-don")
      ]);
      setPlaces(placesRes.items || []);
      setStoriesGroups(storiesRes.groups || []);
    } catch (e) {
      console.error("Feed loading error:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.amber}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Stories Bar */}
            <MobileStoriesBar
              groups={storiesGroups}
              onPlaceSelect={(placeId) => setSelectedPlaceId(placeId)}
            />

            {/* Фильтры категорий */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === "all" && styles.categoryPillActive
                ]}
                onPress={() => setSelectedCategory("all")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === "all" && styles.categoryPillTextActive
                  ]}
                >
                  ✨ Все
                </Text>
              </TouchableOpacity>

              {PLACE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.catEmoji}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive
                      ]}
                    >
                      {cat.label.split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Рекомендации в Ростове</Text>
              <Text style={styles.sectionSub}>{places.length} открытий</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MobilePlaceCard
              place={item}
              onPress={(p) => setSelectedPlaceId(p.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Заведения не найдены</Text>
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color={COLORS.amber}
              style={{ marginTop: 40 }}
            />
          )
        }
      />

      {/* Модалка заведения */}
      <MobilePlaceDetailModal
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  headerContainer: {
    paddingBottom: 8
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 6
  },
  categoryPillActive: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber
  },
  catEmoji: {
    fontSize: 13
  },
  categoryPillText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  categoryPillTextActive: {
    color: COLORS.black,
    fontWeight: "700"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700"
  },
  sectionSub: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: "600"
  },
  cardWrapper: {
    paddingHorizontal: 16
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center"
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14
  }
});
