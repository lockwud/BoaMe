import type { CampaignCategory } from "@boame/shared-types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";
import { createCampaignRequest, type UploadedEvidence, uploadCampaignEvidence } from "../services/campaign-service";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "CreateCampaign">;

const categories: CampaignCategory[] = ["MEDICAL", "EDUCATION", "EMERGENCY", "COMMUNITY", "BUSINESS", "OTHER"];

export function CreateCampaignScreen({ navigation }: Props) {
  const [title, setTitle] = useState("Emergency relief for my family");
  const [category, setCategory] = useState<CampaignCategory>("EMERGENCY");
  const [location, setLocation] = useState("South Tongu, Volta Region");
  const [goalAmount, setGoalAmount] = useState("65000");
  const [description, setDescription] = useState("Support temporary shelter, food, and medication while we recover.");
  const [story, setStory] = useState("Our family needs verified community support after an emergency disrupted our home and income.");
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedEvidence[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function pickEvidence() {
    setIsUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: ["image/*", "application/pdf", "video/*", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      });

      if (result.canceled) return;

      const uploaded = await uploadCampaignEvidence(
        result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType
        }))
      );
      setEvidenceFiles((current) => [...current, ...uploaded]);
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : "Could not upload the selected evidence.");
    } finally {
      setIsUploading(false);
    }
  }

  async function submit() {
    const numericGoal = Number(goalAmount);
    if (title.trim().length < 4 || description.trim().length < 10 || !numericGoal || numericGoal <= 0) {
      Alert.alert("Check request", "Add a title, description, and a valid goal amount.");
      return;
    }
    if (evidenceFiles.length === 0) {
      Alert.alert("Evidence required", "Upload at least one image, PDF, video, or report before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const campaign = await createCampaignRequest({
        title: title.trim(),
        category,
        location: location.trim() || undefined,
        goalAmount: numericGoal,
        minimumDonation: 1,
        description: description.trim(),
        story: story.trim() || undefined,
        documents: evidenceFiles.map((file) => file.url)
      });

      Alert.alert("Request submitted", "Your campaign is now waiting for admin verification.", [
        { text: "View campaigns", onPress: () => navigation.navigate("MainTabs", { screen: "Campaigns" }) },
        { text: "Done", onPress: () => navigation.goBack() }
      ]);
      setTitle(campaign.title);
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Could not create this campaign request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>Beneficiary request</Text>
      <Text style={styles.title}>Request support</Text>
      <Text style={styles.copy}>Submit the need, town, goal, and evidence. Admin will verify it before donors can see it.</Text>

      <Text style={styles.label}>Campaign title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="What support do you need?" placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {categories.map((item) => (
          <Pressable key={item} style={[styles.categoryButton, category === item && styles.categoryButtonActive]} onPress={() => setCategory(item)}>
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Town or region</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Accra, Greater Accra" placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>Goal amount</Text>
      <TextInput style={styles.input} value={goalAmount} onChangeText={setGoalAmount} keyboardType="numeric" placeholder="Amount in GHS" placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>Short description</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline placeholder="Briefly explain the need." placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>Story</Text>
      <TextInput style={[styles.input, styles.textArea]} value={story} onChangeText={setStory} multiline placeholder="Tell the fuller story for review." placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>Evidence files</Text>
      <Pressable style={[styles.uploadButton, isUploading && styles.buttonDisabled]} onPress={pickEvidence} disabled={isUploading}>
        <Text style={styles.uploadButtonText}>{isUploading ? "Uploading..." : "Upload images, PDFs, videos, or reports"}</Text>
      </Pressable>
      {evidenceFiles.length ? (
        <View style={styles.fileList}>
          {evidenceFiles.map((file) => (
            <View key={file.url} style={styles.fileRow}>
              <View style={styles.fileDot} />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileMeta}>{file.mimeType} · {(file.fileSize / 1024).toFixed(1)} KB</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.helper}>Upload at least one document or media file so admin can verify the request.</Text>
      )}

      <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={submit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Submitting..." : "Submit for verification"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  content: {
    padding: 18,
    paddingBottom: 36
  },
  kicker: {
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    marginTop: 6,
    color: "#111827",
    fontSize: 30,
    fontWeight: "900"
  },
  copy: {
    marginTop: 6,
    marginBottom: 18,
    color: "#64748B",
    lineHeight: 21,
    fontWeight: "600"
  },
  label: {
    marginTop: 12,
    marginBottom: 7,
    color: "#111827",
    fontSize: 13,
    fontWeight: "800"
  },
  input: {
    minHeight: 52,
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 18,
    color: "#0F172A",
    fontWeight: "700"
  },
  textArea: {
    minHeight: 106,
    paddingTop: 14,
    textAlignVertical: "top"
  },
  uploadButton: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#EEF7EF",
    borderWidth: 1,
    borderColor: "#D7EED9"
  },
  uploadButtonText: {
    color: colors.primaryGreen,
    fontWeight: "900",
    textAlign: "center"
  },
  fileList: {
    gap: 8,
    marginTop: 10
  },
  fileRow: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC"
  },
  fileDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryGreen
  },
  fileInfo: {
    flex: 1
  },
  fileName: {
    color: "#111827",
    fontWeight: "900"
  },
  fileMeta: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600"
  },
  helper: {
    marginTop: 8,
    color: "#64748B",
    lineHeight: 20,
    fontWeight: "600"
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#F1F3F5"
  },
  categoryButtonActive: {
    backgroundColor: colors.primaryGreen
  },
  categoryText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "900"
  },
  categoryTextActive: {
    color: "#FFFFFF"
  },
  button: {
    height: 52,
    borderRadius: 26,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505"
  },
  buttonDisabled: {
    opacity: 0.65
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  }
});
