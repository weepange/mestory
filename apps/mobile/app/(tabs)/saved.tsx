import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { Bookmark } from "lucide-react-native";
import { Place } from "@mestory/shared";
import { COLORS } from "../../src/theme/colors";
import { mobileApi } from "../../src/api/client";
import { MobilePlaceCard } from "../../src/components/MobilePlaceCard";
import { MobilePlaceDetailModal } from "../../src/components/MobilePlaceDetailModal";

export default function SavedScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    mobileApi
      .getMyBookmarks()
      .then((res) => {
        setPlaces(res.places || []);
      })
      .catch(() => {
        // Запасной список из каталога
        mobileApi.getPlaces("rostov-on-don").then((r) => {
          setPlaces((r.items || []).slice(0, 3));
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Ваши сохраненные места</Text>
            <Text style={styles.subtitle}>
              {places.length} локаций в личной коллекции
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MobilePlaceCard
            place={item}
            onPress={(p) => setSelectedPlaceId(p.id)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Bookmark size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>У вас пока нет сохранений</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={COLORS.amber} />
          )
        }
      />

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
  list: {
    padding: 16
  },
  header: {
    marginBottom: 16
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800"
  },
  subtitle: {
    color: COLORS.amber,
    fontSize: 12,
    marginTop: 2
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    gap: 12
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14
  }
});
