import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from "react-native";
import { User, Sparkles, Building2, MapPin, LogOut } from "lucide-react-native";
import { COLORS } from "../../src/theme/colors";
import { mobileApi, setMobileAuthToken } from "../../src/api/client";

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRole, setActiveRole] = useState<"user" | "creator" | "business">("user");

  const switchRole = async (role: "user" | "creator" | "business") => {
    setActiveRole(role);
    try {
      const res = await mobileApi.demoLogin(role);
      setMobileAuthToken(res.token);
      setCurrentUser(res.user);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    switchRole("creator"); // По умолчанию для наглядности автор
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Карточка профиля */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              currentUser?.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
          }}
          style={styles.avatar}
        />
        <View style={styles.nameRow}>
          <Text style={styles.name}>{currentUser?.name || "Алексей Смирнов"}</Text>
          {currentUser?.isVerifiedCreator && (
            <View style={styles.verifiedBadge}>
              <Sparkles size={12} color={COLORS.amber} />
              <Text style={styles.verifiedText}>Автор</Text>
            </View>
          )}
        </View>
        <Text style={styles.handle}>@{currentUser?.handle || "don_foodie"}</Text>
        <Text style={styles.bio}>
          {currentUser?.bio ||
            "Шеф-редактор 'Гастрономический Ростов'. Знаю, где варят лучший фильтр."}
        </Text>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.4k</Text>
            <Text style={styles.statLabel}>Подписчиков</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Подборок</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>38</Text>
            <Text style={styles.statLabel}>Обзоров</Text>
          </View>
        </View>
      </View>

      {/* Быстрое переключение ролей в демо */}
      <View style={styles.roleSwitcherCard}>
        <Text style={styles.roleSwitcherTitle}>
          Быстрое переключение ролей:
        </Text>
        <View style={styles.roleButtonsRow}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              activeRole === "user" && styles.roleBtnActive
            ]}
            onPress={() => switchRole("user")}
            activeOpacity={0.8}
          >
            <User
              size={16}
              color={activeRole === "user" ? COLORS.black : COLORS.white}
            />
            <Text
              style={[
                styles.roleBtnText,
                activeRole === "user" && styles.roleBtnTextActive
              ]}
            >
              Житель
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              activeRole === "creator" && styles.roleBtnActive
            ]}
            onPress={() => switchRole("creator")}
            activeOpacity={0.8}
          >
            <Sparkles
              size={16}
              color={activeRole === "creator" ? COLORS.black : COLORS.white}
            />
            <Text
              style={[
                styles.roleBtnText,
                activeRole === "creator" && styles.roleBtnTextActive
              ]}
            >
              Автор ⭐
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              activeRole === "business" && styles.roleBtnActive
            ]}
            onPress={() => switchRole("business")}
            activeOpacity={0.8}
          >
            <Building2
              size={16}
              color={activeRole === "business" ? COLORS.black : COLORS.white}
            />
            <Text
              style={[
                styles.roleBtnText,
                activeRole === "business" && styles.roleBtnTextActive
              ]}
            >
              Бизнес 🏢
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Настройки и город */}
      <View style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <MapPin size={18} color={COLORS.amber} />
          <Text style={styles.settingText}>Город: Ростов-на-Дону</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    padding: 16,
    gap: 16
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.amber,
    marginBottom: 12
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800"
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4
  },
  verifiedText: {
    color: COLORS.amber,
    fontSize: 10,
    fontWeight: "700"
  },
  handle: {
    color: COLORS.amber,
    fontSize: 13,
    marginTop: 2
  },
  bio: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)"
  },
  statItem: {
    alignItems: "center"
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800"
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  roleSwitcherCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12
  },
  roleSwitcherTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  roleButtonsRow: {
    flexDirection: "row",
    gap: 8
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6
  },
  roleBtnActive: {
    backgroundColor: COLORS.amber
  },
  roleBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700"
  },
  roleBtnTextActive: {
    color: COLORS.black
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  settingText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600"
  }
});
