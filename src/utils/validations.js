// Função para validar o formato do e-mail
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Por favor, insira um e-mail válido.";
  }
  return true;
};

// Validação de CPF
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11) {
    return "CPF deve ter 11 dígitos.";
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return "CPF inválido.";
  }

  // Validação dos dígitos verificadores
  /** 
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) {
    return "CPF inválido.";
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) {
    return "CPF inválido.";
  }
  */

  return true;
};

// Validação de RA
export const validateRA = (ra) => {
  if (!ra) {
    return "RA é obrigatório.";
  }
  if (!/^\d{11}$/.test(ra)) {
    return "RA deve ter exatamente 11 dígitos numéricos.";
  }
  return true;
};

// Validação de Course
export const validateCourse = (course) => {
  const validCourses = [
    "Desenvolvimento de sistemas",
    "Administração",
    "Logistica",
    "Eletromecânica",
  ];
  if (!validCourses.includes(course)) {
    return "Selecione um curso válido.";
  }
  return true;
};

// Validação de senha
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 12) {
    errors.push("A senha deve ter no mínimo 12 caracteres.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra minúscula.");
  }

  if (!/\d/.test(password)) {
    errors.push("A senha deve conter pelo menos um número.");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("A senha deve conter pelo menos um caractere especial.");
  }

  return errors.length === 0 ? true : errors.join(" ");
};

export const educationValidations = {
  institution: (value) => (!value?.trim() ? 'Instituição é obrigatória' : ''),
  courseDegree: (value) => (!value?.trim() ? 'Curso/grau é obrigatório' : ''),
  startDate: (value) => {
    if (!value) return 'Data de início é obrigatória';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Formato inválido (use AAAA-MM-DD)';
    return '';
  },
  endDate: (value) => 
    (value && !/^\d{4}-\d{2}-\d{2}$/.test(value) ? 'Formato inválido (use AAAA-MM-DD)' : ''),
};

export const experienceValidations = {
  title: (value) => (!value?.trim() ? 'Cargo/função é obrigatório' : ''),
  company: (value) => (!value?.trim() ? 'Empresa é obrigatória' : ''),
  startDate: (value) => {
    if (!value) return 'Data de início é obrigatória';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Formato inválido (use AAAA-MM-DD)';
    return '';
  },
  endDate: (value) => 
    (value && !/^\d{4}-\d{2}-\d{2}$/.test(value) ? 'Formato inválido (use AAAA-MM-DD)' : ''),
};