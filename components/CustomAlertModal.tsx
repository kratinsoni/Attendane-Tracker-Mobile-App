import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. The Interface
interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info"; // Optional: Use this to change button colors if you want!
  onClose: () => void;
  mode?: "single" | "confirm";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// 2. The Component
const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  type = "info",
  onClose,
  mode = "single",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  // Determine button color based on the type of alert
  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "#10B981"; // Green
      case "error":
        return "#EF4444"; // Red
      default:
        return "#3B82F6"; // Blue
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* Guaranteed Visible Title */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {mode === "confirm" ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel ?? onClose}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: getButtonColor() }]}
                  onPress={onConfirm ?? onClose}
                >
                  <Text style={styles.buttonText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: getButtonColor() }]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 3. The Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000", // Explicitly black
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#4A4A4A",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#1F2937",
  },
});

export default CustomAlertModal;
