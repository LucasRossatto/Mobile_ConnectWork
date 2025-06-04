import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import api from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Picker } from "@react-native-picker/picker";

const ReportModal = ({ visible, postId, onClose }) => {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportPostMutation = useMutation({
    mutationFn: (reportData) =>
      api.post(`/user/report/post/${postId}`, reportData),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Post denunciado com sucesso!");
      setReportReason("");
      setReportDescription("");
      onClose();
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao denunciar o post. Tente novamente.";
      Alert.alert("Erro", errorMessage);
    },
    onSettled: () => {
      setIsSubmitting(false);
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-11/12">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Denunciar Post</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-600 mb-2">Escolha um motivo</Text>
          <View className="border rounded-2xl mb-4 border-gray-300 ">
            <Picker
              style={{
                fontSize: 16,
                color: "#666666",
              }}
              selectedValue={reportReason}
              onValueChange={(itemValue) => setReportReason(itemValue)}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Selecione um motivo" value="" />
              <Picker.Item label="Spam" value="Spam" />
              <Picker.Item
                label="Conteúdo impróprio"
                value="Conteúdo impróprio"
              />
              <Picker.Item label="Assédio" value="Assédio" />
            </Picker>
          </View>

          <Text className="text-sm text-gray-600 mb-2">Descreva o motivo</Text>

          <TextInput
            className="border rounded-2xl mb-4 border-gray-300  p-4 h-24 text-left align-top"
            multiline
            placeholder="Descreva o motivo (mínimo 10 caracteres)"
            onChangeText={setReportDescription}
            value={reportDescription}
            editable={!isSubmitting}
          />

          <View className="flex-row justify-end gap-2">
            <TouchableOpacity
              className="px-4 py-2 bg-gray-100 rounded"
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text className="text-black font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-100 rounded"
              onPress={handleReportPost}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-red-600 font-bold">Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;
