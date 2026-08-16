import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Star, Bookmark, Navigation, MapPin } from "lucide-react-native";
import { Place, PLACE_CATEGORIES } from "@mestory/shared";
import { COLORS } from "../theme/colors";
import { mobileApi } from "../api/client";

interface MobilePlaceCardProps {
  place: Place;
  onPress: (place: Place) => void;
}

export function MobilePlaceCard({ place, onPress }: MobilePlaceCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const category = PLACE_CATEGORIES.find((c) => c.id === place.category);

  const handleBookmarkToggle = async () => {
    try {
      const res = await mobileApi.toggleBookmark("PLACE", place.id);
      setIsSaved(res.saved);
    } catch (e) {
      setIsSaved(!isSaved);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(place)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: place.coverPhoto }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Категория */}
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryLabel}>
              {category.label.split(" ")[0]}
            </Text>
          </View>
        )}

        {/* Закладка */}
        <TouchableOpacity
          style={[styles.bookmarkBtn, isSaved && styles.bookmarkBtnSaved]}
          onPress={handleBookmarkToggle}
          activeOpacity={0.8}
        >
          <Bookmark
            size={16}
            color={isSaved ? COLORS.black : COLORS.white}
            fill={isSaved ? COLORS.black : "none"}
          />
        </TouchableOpacity>

        {/* Рейтинг */}
        <View style={styles.ratingBadge}>
          <Star size={13} color={COLORS.amber} fill={COLORS.amber} />
          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>({place.reviewsCount})</Text>
        </View>
      </View>

      {/* Информация */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {place.summary}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.addressRow}>
            <MapPin size={13} color={COLORS.textMuted} />
            <Text style={styles.addressText} numberOfLines={1}>
              {place.address}
            </Text>
          </View>

          {place.averageCheck && (
            <Text style={styles.checkText}>{place.averageCheck}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4
  },
  categoryIcon: {
    fontSize: 12
  },
  categoryLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700"
  },
  bookmarkBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)"
  },
  bookmarkBtnSaved: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber
  },
  ratingBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  ratingText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: "700"
  },
  reviewsText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11
  },
  body: {
    padding: 16,
    gap: 6
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700"
  },
  summary: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)"
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 8
  },
  addressText: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  checkText: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: "600"
  }
});
