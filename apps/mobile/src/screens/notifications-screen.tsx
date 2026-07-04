import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SkeletonLoader } from "../components/skeleton-loader";
import { getNotifications, type NotificationItem } from "../services/settings-service";
import { colors } from "../theme/colors";

type Filter = "all" | "unread";

function timeAgo(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let mounted = true;

    getNotifications()
      .then((items) => {
        if (mounted) setNotifications(items);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visibleNotifications = useMemo(
    () => (filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications),
    [filter, notifications]
  );

  function markAsRead(id: string) {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  function markAllAsRead() {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Ionicons name="notifications" size={21} color={colors.primaryGreen} />
      </View>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, filter === "all" && styles.activeTab]} onPress={() => setFilter("all")}>
          <Text style={[styles.tabText, filter === "all" && styles.activeTabText]}>All</Text>
        </Pressable>
        <Pressable style={[styles.tab, filter === "unread" && styles.activeTab]} onPress={() => setFilter("unread")}>
          <Text style={[styles.tabText, filter === "unread" && styles.activeTabText]}>Unread</Text>
        </Pressable>
        {unreadCount > 0 ? (
          <Pressable style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.skeletonRow}>
              <SkeletonLoader width={24} height={24} borderRadius={12} />
              <View style={styles.skeletonContent}>
                <SkeletonLoader width="70%" height={14} />
                <SkeletonLoader width="94%" height={13} />
                <SkeletonLoader width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {!loading && visibleNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={28} color={colors.primaryGreen} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyCopy}>Updates from donations, campaigns, and receipts will appear here.</Text>
        </View>
      ) : null}

      {!loading
        ? visibleNotifications.map((notification) => (
            <Pressable key={notification.id} style={styles.notificationRow} onPress={() => markAsRead(notification.id)}>
              <Ionicons name="notifications" size={18} color={colors.primaryGreen} style={styles.bellIcon} />
              <View style={styles.notificationBody}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={1}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{timeAgo(notification.createdAt)}</Text>
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>{notification.body}</Text>
                {!notification.read ? (
                  <Pressable onPress={() => markAsRead(notification.id)}>
                    <Text style={styles.markReadText}>Mark as read</Text>
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
          ))
        : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8"
  },
  content: {
    padding: 18,
    paddingBottom: 104
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900"
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 18
  },
  tab: {
    paddingBottom: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryGreen
  },
  tabText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800"
  },
  activeTabText: {
    color: "#111827"
  },
  markAllButton: {
    marginLeft: "auto"
  },
  markAllText: {
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: "900"
  },
  skeletonList: {
    gap: 20
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 12
  },
  skeletonContent: {
    flex: 1,
    gap: 8
  },
  notificationRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14
  },
  bellIcon: {
    marginTop: 2
  },
  notificationBody: {
    flex: 1
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  notificationTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "900"
  },
  notificationTime: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700"
  },
  notificationMessage: {
    marginTop: 5,
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500"
  },
  markReadText: {
    alignSelf: "flex-start",
    marginTop: 8,
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: "900"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 70
  },
  emptyTitle: {
    marginTop: 12,
    color: "#111827",
    fontSize: 16,
    fontWeight: "900"
  },
  emptyCopy: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center"
  }
});
