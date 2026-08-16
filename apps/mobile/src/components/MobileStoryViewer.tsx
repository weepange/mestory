import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar
} from "react-native";
import { X, MapPin, ChevronRight, Eye } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { mobileApi } from "../api/client";

const { width, height } = Dimensions.get("window");

interface MobileStoryViewerProps {
  groups: any[];
  initialGroupIndex: number;
  onClose: () => void;
  onPlaceSelect?: (placeId: string) => void;
}

export function MobileStoryViewer({
  groups,
  initialGroupIndex,
  onClose,
  onPlaceSelect
}: MobileStoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentStory?.id) {
      mobileApi.viewStory(currentStory.id).catch(() => {});
    }
  }, [currentStory?.id]);

  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = 50;
    const step = 100 / (5000 / interval);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [groupIndex, storyIndex, isPaused, currentStory]);

  const handleNext = () => {
    setProgress(0);
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={styles.backdrop}>
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Верхняя панель с прогресс-барами */}
          <View style={styles.topContainer}>
            <View style={styles.progressRow}>
              {currentGroup.stories.map((_: any, idx: number) => (
                <View key={idx} style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width:
                          idx === storyIndex
                            ? `${progress}%`
                            : idx < storyIndex
                            ? "100%"
                            : "0%"
                      }
                    ]}
                  />
                </View>
              ))}
            </View>

            <View style={styles.authorRow}>
              <View style={styles.authorInfo}>
                <Image
                  source={{
                    uri:
                      currentGroup.author.avatarUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                  }}
                  style={styles.authorAvatar}
                />
                <View>
                  <Text style={styles.authorName}>
                    {currentGroup.author.name}
                  </Text>
                  <Text style={styles.authorHandle}>
                    @{currentGroup.author.handle}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Тач-области */}
          <View style={styles.touchArea}>
            <TouchableWithoutFeedback
              onPress={handlePrev}
              onPressIn={() => setIsPaused(true)}
              onPressOut={() => setIsPaused(false)}
            >
              <View style={styles.leftTouch} />
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={handleNext}
              onPressIn={() => setIsPaused(true)}
              onPressOut={() => setIsPaused(false)}
            >
              <View style={styles.rightTouch} />
            </TouchableWithoutFeedback>
          </View>

          {/* Нижний блок: Заголовок и привязка к заведению */}
          <View style={styles.bottomContainer}>
            <Text style={styles.storyTitle}>{currentStory.title}</Text>

            {currentStory.placeId && (
              <TouchableOpacity
                style={styles.venueBadge}
                activeOpacity={0.85}
                onPress={() => {
                  if (onPlaceSelect && currentStory.placeId) {
                    onPlaceSelect(currentStory.placeId);
                  }
                }}
              >
                <View style={styles.venueBadgeLeft}>
                  <View style={styles.pinIcon}>
                    <MapPin size={16} color={COLORS.amber} />
                  </View>
                  <View>
                    <Text style={styles.venueName}>
                      {currentStory.placeName || "Смотреть место"}
                    </Text>
                    <Text style={styles.venueSub}>
                      Карточка и маршрут на карте
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.amber} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000"
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between"
  },
  topContainer: {
    paddingHorizontal: 16,
    paddingTop: 10
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12
  },
  progressBarBg: {
    flex: 1,
    height: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.amber
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.amber
  },
  authorName: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 13
  },
  authorHandle: {
    color: COLORS.amber,
    fontSize: 11
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  touchArea: {
    flex: 1,
    flexDirection: "row"
  },
  leftTouch: {
    width: "35%",
    height: "100%"
  },
  rightTouch: {
    width: "65%",
    height: "100%"
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12
  },
  storyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6
  },
  venueBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(22, 27, 34, 0.85)",
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)"
  },
  venueBadgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  pinIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center"
  },
  venueName: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 13
  },
  venueSub: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11
  }
});
