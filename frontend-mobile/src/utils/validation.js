// frontend-mobile/src/utils/validation.js

export const validatePassword = (password) => {
  let errors = [];

  // 1. Pelo menos 8 caracteres de comprimento
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres.');
  }
  // 2. Pelo menos um caractere maiúsculo
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula.');
  }
  // 3. Pelo menos um caractere minúsculo
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula.');
  }
  // 4. Pelo menos um número
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número.');
  }
  // 5. Pelo menos um caractere especial
  if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial (ex: !@#$%).');
  }

  return errors; // Retorna um array de strings de erro. Se vazio, a senha é válida.
};