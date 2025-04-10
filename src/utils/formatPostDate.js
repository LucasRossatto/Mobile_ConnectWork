export const formatPostDate = (dateString) => {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  try {
    return dateString
      ? new Date(dateString).toLocaleString("pt-BR", options)
      : "Data inválida";
  } catch {
    return "Data inválida";
  }
};
