import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking
} from "react-native";
import { MapPin, Navigation, Compass, ExternalLink } from "lucide-react-native";
import { Place } from "@mestory/shared";
import { COLORS } from "../../src/theme/colors";
import { mobileApi } from "../../src/api/client";
import { MobilePlaceDetailModal } from "../../src/components/MobilePlaceDetailModal";

export default function ExploreMapScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    mobileApi.getPlaces("rostov-on-don").then((res) => {
      setPlaces(res.items || []);
    });
  }, []);

  const openYandexFullMap = () => {
    const url = "https://yandex.ru/maps/39/rostov-na-donu/";
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* Стилизованная шапка карты с кнопкой Яндекс.Карт */}
      <View style={styles.mapBanner}>
        <View style={styles.mapBannerContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🗺️ Ростов-на-Дону</Text>
          </View>
          <Text style={styles.mapTitle}>Интерактивная карта открытий</Text>
          <Text style={styles.mapSub}>
            Выберите место для просмотра информации или открытия в навигаторе
          </Text>

          <TouchableOpacity
            style={styles.yandexBtn}
            onPress={openYandexFullMap}
            activeOpacity={0.85}
          >
            <Navigation size={16} color={COLORS.black} fill={COLORS.black} />
            <Text style={styles.yandexBtnText}>Открыть в Яндекс.Картах</Text>
            <ExternalLink size={14} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Список меток / мест на карте */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <Text style={styles.listHeader}>Места на карте ({places.length})</Text>

        {places.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.placeItem}
            activeOpacity={0.8}
            onPress={() => setSelectedPlaceId(place.id)}
          >
            <View style={styles.placePin}>
              <MapPin size={18} color={COLORS.amber} />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
            </View>
            <Text style={styles.placeRating}>⭐ {place.rating}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  mapBanner: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  mapBannerContent: {
    gap: 8
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)"
  },
  badgeText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: "700"
  },
  mapTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800"
  },
  mapSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17
  },
  yandexBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.amber,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    marginTop: 8
  },
  yandexBtnText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "800"
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10
  },
  listHeader: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4
  },
  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12
  },
  placePin: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center"
  },
  placeInfo: {
    flex: 1,
    gap: 2
  },
  placeName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700"
  },
  placeAddress: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  placeRating: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: "700"
  }
});
