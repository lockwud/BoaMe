import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type WeatherAlert = {
  id: string;
  type: "flood" | "fire" | "storm" | "drought" | "heatwave";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  description: string;
  timestamp: string;
  probability: number;
};

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  alerts: WeatherAlert[];
};

const mockWeatherData: WeatherData = {
  temperature: 28,
  humidity: 75,
  windSpeed: 12,
  condition: "Partly Cloudy",
  location: "Accra, Ghana",
  alerts: [
    {
      id: "1",
      type: "flood",
      severity: "high",
      location: "Accra Central",
      description: "Potential flooding predicted based on historical patterns and current rainfall",
      timestamp: "2 hours ago",
      probability: 78
    },
    {
      id: "2",
      type: "storm",
      severity: "medium",
      location: "Kumasi Region",
      description: "Thunderstorm likely in next 24 hours based on seasonal data",
      timestamp: "5 hours ago",
      probability: 65
    },
    {
      id: "3",
      type: "fire",
      severity: "low",
      location: "Northern Region",
      description: "Increased fire risk due to dry conditions",
      timestamp: "1 day ago",
      probability: 45
    }
  ]
};

function getSeverityColor(severity: WeatherAlert["severity"]): string {
  switch (severity) {
    case "critical":
      return "#DC2626";
    case "high":
      return "#EA580C";
    case "medium":
      return "#D97706";
    case "low":
      return "#65A30D";
  }
}

function getAlertIcon(type: WeatherAlert["type"]): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "flood":
      return "water";
    case "fire":
      return "flame";
    case "storm":
      return "thunderstorm";
    case "drought":
      return "sunny";
    case "heatwave":
      return "thermometer";
  }
}

function getAlertLabel(type: WeatherAlert["type"]): string {
  switch (type) {
    case "flood":
      return "Flood Warning";
    case "fire":
      return "Fire Risk";
    case "storm":
      return "Storm Alert";
    case "drought":
      return "Drought Warning";
    case "heatwave":
      return "Heatwave Alert";
  }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Simulate fetching weather and prediction data
    setTimeout(() => {
      setWeather(mockWeatherData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading weather data...</Text>
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  const criticalAlerts = weather.alerts.filter(alert => alert.severity === "critical" || alert.severity === "high");

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="partly-sunny" size={24} color={colors.primaryGreen} />
          </View>
          <View>
            <Text style={styles.title}>Weather & Disaster Monitor</Text>
            <Text style={styles.subtitle}>{weather.location}</Text>
          </View>
        </View>
        {criticalAlerts.length > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{criticalAlerts.length}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.weatherGrid}>
        <View style={styles.weatherItem}>
          <Ionicons name="thermometer" size={20} color="#EA580C" />
          <Text style={styles.weatherValue}>{weather.temperature}°C</Text>
          <Text style={styles.weatherLabel}>Temp</Text>
        </View>
        <View style={styles.weatherItem}>
          <Ionicons name="water" size={20} color="#3B82F6" />
          <Text style={styles.weatherValue}>{weather.humidity}%</Text>
          <Text style={styles.weatherLabel}>Humidity</Text>
        </View>
        <View style={styles.weatherItem}>
          <Ionicons name="speedometer" size={20} color="#10B981" />
          <Text style={styles.weatherValue}>{weather.windSpeed}km/h</Text>
          <Text style={styles.weatherLabel}>Wind</Text>
        </View>
        <View style={styles.weatherItem}>
          <Ionicons name="cloudy" size={20} color="#6B7280" />
          <Text style={styles.weatherValue}>{weather.condition}</Text>
          <Text style={styles.weatherLabel}>Condition</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>Predictive Alerts</Text>
          <Text style={styles.alertsSubtitle}>Based on historical incident data</Text>
          {weather.alerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertHeaderLeft}>
                  <Ionicons name={getAlertIcon(alert.type)} size={20} color={getSeverityColor(alert.severity)} />
                  <Text style={styles.alertType}>{getAlertLabel(alert.type)}</Text>
                </View>
                <View style={[styles.probabilityBadge, { backgroundColor: getSeverityColor(alert.severity) + "20" }]}>
                  <Text style={[styles.probabilityText, { color: getSeverityColor(alert.severity) }]}>
                    {alert.probability}%
                  </Text>
                </View>
              </View>
              <Text style={styles.alertLocation}>{alert.location}</Text>
              <Text style={styles.alertDescription}>{alert.description}</Text>
              <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    padding: 16,
    marginBottom: 16
  },
  loading: {
    color: colors.muted,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: "#EDF7EE",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 2
  },
  alertBadge: {
    backgroundColor: "#DC2626",
    borderRadius: 999,
    minWidth: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  alertBadgeText: {
    color: "white",
    fontWeight: "900",
    fontSize: 12
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  weatherItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginTop: 4
  },
  weatherLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase"
  },
  alertsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E7EAF0"
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4
  },
  alertsSubtitle: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
    marginBottom: 12
  },
  alertCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    gap: 6
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  alertHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  alertType: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text
  },
  probabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  probabilityText: {
    fontSize: 12,
    fontWeight: "900"
  },
  alertLocation: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 28
  },
  alertDescription: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginLeft: 28
  },
  alertTimestamp: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
    marginLeft: 28,
    marginTop: 4
  }
});