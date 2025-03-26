import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { remove, put } from "@/services/api";
import log from "@/utils/logger";


const ModalEditEducation = ({
  visible,
  onClose,
  education,
  onUpdateEducation,
}) => {
  const [loading, setLoading] = useState(false);


  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [formData, setFormData] = useState({
    institution: education?.institution || "",
    courseDegree: education?.courseDegree || "",
    fieldOfStudy: education?.fieldOfStudy || "",
    startDate: education?.startDate ? formatDisplayDate(education.startDate) : "",
    endDate: education?.endDate ? formatDisplayDate(education.endDate) : "",
    description: education?.description || "",
  });

  const deleteEducation = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta formação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await remove(`/user/education/${education.id}`);
              log.debug("Res Tentativa de deletar", res)
              if(res.status = 200){
                Alert.alert("Sucesso", "A formação acadêmica foi deletada com sucesso");
              }

              if (onUpdateEducation) {
                onUpdateEducation({ action: 'delete', id: education.id });
            }

              onClose();
            } catch (error) {
              log.error("Erro ao deletar educação:", error);
              if(error.status = 404){
                Alert.alert("Erro", "Não foi possível encontrar a formação acadêmica");
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleEdit = async () => {
    

    try {
      setLoading(true);

     

      const payload = {
        ...(formData.institution && { institution: formData.institution }),
        ...(formData.courseDegree && { courseDegree: formData.courseDegree }),
        ...(formData.fieldOfStudy && { fieldOfStudy: formData.fieldOfStudy }),
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
        ...(formData.description && { description: formData.description }),
      };
      log.debug("Debug Dados enviados:",payload)

      
      const res = await put(`/user/education/${education.id}`, payload);
      if(res.status = 200){
        Alert.alert("Sucesso", "Formação acadêmica editada com sucesso");

      }
      log.debug("Debug tentativa de editar:",res)
      if (onUpdateEducation) {
        onUpdateEducation({ action: 'update', data: res });
    }
      onClose();
    } catch (error) {
      log.error("Erro ao editar educação:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="w-full bg-white rounded-lg p-6 max-w-md">
          {/* Cabeçalho */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Editar Formação</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

         <ScrollView showsVerticalScrollIndicator={false}>
            {/* Campos com placeholders dos valores existentes */}
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Instituição *</Text>
              <TextInput
                value={formData.institution}
                onChangeText={(text) => handleChange("institution", text)}
                className="border rounded-md py-2 px-3 text-base"
                placeholder={education?.institution || "Nome da instituição"}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Curso/Grau *</Text>
              <TextInput
                value={formData.courseDegree}
                onChangeText={(text) => handleChange("courseDegree", text)}
                className="border rounded-md py-2 px-3 text-base"
                placeholder={education?.courseDegree || "Ex: Bacharelado em Ciência da Computação"}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Área de Estudo</Text>
              <TextInput
                value={formData.fieldOfStudy}
                onChangeText={(text) => handleChange("fieldOfStudy", text)}
                className="border rounded-md py-2 px-3 text-base"
                placeholder={education?.fieldOfStudy || "Ex: Ciência da Computação"}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Data de Início *</Text>
              <TextInput
                value={formData.startDate}
                onChangeText={(text) => handleChange("startDate", text)}
                className="border rounded-md py-2 px-3 text-base"
                placeholder={education?.startDate ? formatDisplayDate(education.startDate) : "DD/MM/AAAA"}
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Data de Término</Text>
              <TextInput
                value={formData.endDate}
                onChangeText={(text) => handleChange("endDate", text)}
                className="border rounded-md py-2 px-3 text-base"
                placeholder={education?.endDate ? formatDisplayDate(education.endDate) : "DD/MM/AAAA (opcional)"}
                keyboardType="numeric"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium mb-2">Descrição</Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => handleChange("description", text)}
                className="border rounded-md py-2 px-3 text-base h-24"
                placeholder={education?.description || "Descrição adicional (opcional)"}
                multiline={true}
              />
            </View>
          </ScrollView>

          {/* Rodapé com botões */}
          <View className="flex-row justify-between items-center mt-4">
            <TouchableOpacity
              onPress={deleteEducation}
              className="py-2 px-4"
              disabled={loading}
            >
              <Text className="text-gray-500 font-bold">Excluir</Text>
            </TouchableOpacity>

            <View className="flex-row">
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-200 py-2 px-4 rounded-md mr-2"
                disabled={loading}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEdit}
                className="bg-black py-2 px-4 rounded-md"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white">Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalEditEducation;
