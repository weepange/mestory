import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  SafeAreaView
} from "react-native";
import {
  X,
  MapPin,
  Clock,
  Star,
  Navigation,
  Bookmark,
  Share2,
  Phone
} from "lucide-react-native";
import { Place } from "@mestory/shared";
import { COLORS } from "../theme/colors";
import { mobileApi } from "../api/client";

interface MobilePlaceDetailModalProps {
  placeId: string | null;
  onClose: () => void;
}

export function MobilePlaceDetailModal({
  placeId,
  onClose
}: MobilePlaceDetailModalProps) {
  const [place, setPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!placeId) return;
    setIsLoading(true);
    mobileApi
      .getPlace(placeId)
      .then((data) => {
        setPlace(data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, [placeId]);

  if (!placeId) return null;

  const openYandexMaps = () => {
    if (!place) return;
    const url = `https://yandex.ru/maps/?rtext=~${place.lat},${place.lng}&rtt=auto`;
    Linking.openURL(url).catch(() => {});
  };

  const handleBookmarkToggle = async () => {
    try {
      const res = await mobileApi.toggleBookmark("PLACE", place.id);
      setIsSaved(res.saved);
    } catch {
      setIsSaved(!isSaved);
    }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent}>
          {/* Шапка модалки */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {place?.name || "Детали заведения"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Загрузка...</Text>
            </View>
          ) : place ? (
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Фото */}
              <Image source={{ uri: place.coverPhoto }} style={styles.coverImage} />

              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.name}>{place.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Star size={14} color={COLORS.amber} fill={COLORS.amber} />
                    <Text style={styles.ratingText}>
                      {place.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.summary}>{place.summary}</Text>

                {/* Быстрое действие: Яндекс.Карты */}
                <TouchableOpacity
                  style={styles.routeBtn}
                  onPress={openYandexMaps}
                  activeOpacity={0.85}
                >
                  <Navigation size={18} color={COLORS.black} fill={COLORS.black} />
                  <Text style={styles.routeBtnText}>
                    Построить маршрут в Яндекс.Картах
                  </Text>
                </TouchableOpacity>

                {/* Адрес и время */}
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <MapPin size={16} color={COLORS.amber} />
                    <Text style={styles.infoText}>{place.address}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Clock size={16} color={COLORS.emerald} />
                    <Text style={styles.infoText}>{place.workingHoursText}</Text>
                  </View>

                  {place.phone && (
                    <View style={styles.infoRow}>
                      <Phone size={16} color={COLORS.indigo} />
                      <Text style={styles.infoText}>{place.phone}</Text>
                    </View>
                  )}
                </View>

                {/* Описание */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>О заведении</Text>
                  <Text style={styles.descriptionText}>{place.description}</Text>
                </View>

                {/* Отзывы */}
                {place.reviews && place.reviews.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Отзывы экспертов ({place.reviews.length})
                    </Text>
                    {place.reviews.map((rev: any) => (
                      <View key={rev.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <Text style={styles.reviewAuthor}>
                            {rev.author.name}
                          </Text>
                          <Text style={styles.reviewRating}>⭐ {rev.rating || 5}</Text>
                        </View>
                        <Text style={styles.reviewText}>{rev.content}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end"
  },
  modalContent: {
    height: "90%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: COLORS.card
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 10
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13
  },
  scroll: {
    flex: 1
  },
  coverImage: {
    width: "100%",
    height: 220
  },
  body: {
    padding: 20,
    gap: 16
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  name: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    flex: 1
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  ratingText: {
    color: COLORS.amber,
    fontSize: 13,
    fontWeight: "700"
  },
  summary: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  routeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.amber,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8
  },
  routeBtnText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "800"
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  infoText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700"
  },
  descriptionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
    gap: 6
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  reviewAuthor: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  reviewRating: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: "700"
  },
  reviewText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16
  }
});
