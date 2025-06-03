import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { X } from "lucide-react-native";
import api from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Picker } from "@react-native-picker/picker";

const ReportModal = ({ visible, postId, onClose }) => {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportPostMutation = useMutation({
    mutationFn: (reportData) =>
      api.post(`/user/report/post/${postId}`, reportData),
    onSuccess: () => {
      Alert.alert("Sucesso", "Post denunciado com sucesso!");
      setReportReason("");
      setReportDescription("");
      setShowReportModal(false);
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((post) => post.id !== postId);
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao denunciar o post. Tente novamente.";
      Alert.alert("Erro", errorMessage);
    },
  });

  const handleReportPost = () => {
    if (!reportReason) {
      Alert.alert("Atenção", "Por favor, selecione um motivo para a denúncia");
      return;
    }

    if (!reportDescription || reportDescription.length < 10) {
      Alert.alert("Atenção", "A descrição deve ter pelo menos 10 caracteres");
      return;
    }

    reportPostMutation.mutate({
      reason: reportReason,
      description: reportDescription,
      notifierId: user.id,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-11/12">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Denunciar Post</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Picker selectedValue={reportReason} onValueChange={setReportReason}>
            <Picker.Item label="Selecione um motivo" value="" />
            <Picker.Item label="Spam" value="Spam" />
            <Picker.Item
              label="Conteúdo impróprio"
              value="Conteúdo impróprio"
            />
            <Picker.Item label="Assédio" value="Assédio" />
          </Picker>

          <TextInput
            className="border rounded p-2 mb-4 h-24 text-left align-top"
            multiline
            placeholder="Descreva o motivo"
            value={reportDescription}
            onChangeText={setReportDescription}
          />

          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity
              className="px-4 py-2 bg-gray-300 rounded"
              onPress={onClose}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 bg-red-600 rounded"
              onPress={handleReportPost}
            >
              <Text className="text-white">Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;
