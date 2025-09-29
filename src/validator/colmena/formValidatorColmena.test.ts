// formValidatorColmena.test.ts

import { FormValidatorColmena, FormData } from './formValidatorColmena';

describe('FormValidatorColmena', () => {
  const validCountries = [
    'Brasil',
    'Argentina',
    'Chile',
    'México',
    'Estados Unidos',
    'Canadá',
    'Espanha',
    'Portugal',
  ] as const;

  let validator: FormValidatorColmena;

  beforeEach(() => {
    validator = new FormValidatorColmena(validCountries);
  });

  describe('Inicialização', () => {
    it('deve lançar erro se países não forem fornecidos', () => {
      expect(() => new FormValidatorColmena([])).toThrow('Lista de países permitidos é obrigatória e não pode estar vazia.');
    });

    it('deve lançar erro se países não forem um array', () => {
      // Forçamos o erro de forma explícita sem depender de @ts-expect-error
      const invalidInput: any = null;
      expect(() => new FormValidatorColmena(invalidInput)).toThrow('Lista de países permitidos é obrigatória e não pode estar vazia.');
    });
  });

  describe('Validação de Nome Completo', () => {
    it('deve aceitar nome válido com acentos e hífens', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: 'João da Silva Costa e Souza' });
      expect(result.isValid).toBe(true);
      expect(result.errors).not.toHaveProperty('fullName');
    });

    it('deve rejeitar nome com números', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: 'João 123 Silva' });
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBe('Nome completo contém caracteres inválidos. Use apenas letras, acentos, hífens, apóstrofos e espaços.');
    });

    it('deve rejeitar nome com símbolos', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: 'João @ Silva' });
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBe('Nome completo contém caracteres inválidos. Use apenas letras, acentos, hífens, apóstrofos e espaços.');
    });

    it('deve normalizar espaços múltiplos', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: '  João    da   Silva  ' });
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar nome com menos de 3 caracteres após normalização', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: 'Jo' });
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toContain('mínimo 3 caracteres');
    });

    it('deve rejeitar nome sem sobrenome', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: 'João' });
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBe('Nome completo deve conter pelo menos nome e sobrenome.');
    });

    it('deve rejeitar nome sem letras válidas', () => {
      const result = validator.validate({ ...minimalValidData(), fullName: " - ' - " });
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBe('Nome deve conter ao menos uma letra válida.');
    });
  });

  describe('Validação de Email', () => {
    const validEmails = [
      'user@gmail.com',
      'user@hotmail.com',
      'user@uol.com.br',
      'test@protonmail.com',
    ];

    validEmails.forEach(email => {
      it(`deve aceitar email válido: ${email}`, () => {
        const result = validator.validate({ ...minimalValidData(), email });
        expect(result.isValid).toBe(true);
      });
    });

    it('deve rejeitar email com typo comum', () => {
      const result = validator.validate({ ...minimalValidData(), email: 'user@gmail.con' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Domínio "gmail.con" parece incorreto. Você quis dizer: gmail.com?');
    });

    it('deve rejeitar email com TLD inválido', () => {
      const result = validator.validate({ ...minimalValidData(), email: 'user@example.c0m' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Domínio de email inválido ou TLD não reconhecido.');
    });

    it('deve rejeitar email mal formatado', () => {
      const result = validator.validate({ ...minimalValidData(), email: 'not-an-email' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Formato de email inválido.');
    });

    it('deve rejeitar email vazio', () => {
      const result = validator.validate({ ...minimalValidData(), email: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email é obrigatório.');
    });
  });

  describe('Validação de Data de Nascimento', () => {
    it('deve aceitar data válida com 18+ anos (ISO)', () => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      eighteenYearsAgo.setDate(eighteenYearsAgo.getDate() - 1); // um dia a mais de idade

      const result = validator.validate({
        ...minimalValidData(),
        birthDate: eighteenYearsAgo.toISOString().split('T')[0],
      });
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar data válida no formato DD/MM/YYYY', () => {
      const result = validator.validate({ ...minimalValidData(), birthDate: '15/05/1990' });
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar data futura', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = validator.validate({ ...minimalValidData(), birthDate: tomorrow });
      expect(result.isValid).toBe(false);
      expect(result.errors.birthDate).toContain('pelo menos 18 anos');
    });

    it('deve rejeitar data com menos de 18 anos', () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 17);
      const result = validator.validate({ ...minimalValidData(), birthDate: recentDate });
      expect(result.isValid).toBe(false);
      expect(result.errors.birthDate).toContain('pelo menos 18 anos');
    });

    it('deve rejeitar data inválida (string)', () => {
      const result = validator.validate({ ...minimalValidData(), birthDate: 'invalid-date' });
      expect(result.isValid).toBe(false);
      expect(result.errors.birthDate).toBe('Data de nascimento inválida ou em formato não suportado.');
    });

    it('deve rejeitar data muito antiga', () => {
      const result = validator.validate({ ...minimalValidData(), birthDate: '1800-01-01' });
      expect(result.isValid).toBe(false);
      expect(result.errors.birthDate).toBe('Data de nascimento muito antiga (antes de 1900).');
    });
  });

  describe('Validação de País', () => {
    it('deve aceitar país válido', () => {
      const result = validator.validate({ ...minimalValidData(), country: 'Brasil' });
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar país com espaços ao redor', () => {
      const result = validator.validate({ ...minimalValidData(), country: '  Brasil  ' });
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar país inexistente', () => {
      const result = validator.validate({ ...minimalValidData(), country: 'França' });
      expect(result.isValid).toBe(false);
      expect(result.errors.country).toBe('País não permitido ou inválido.');
    });

    it('deve rejeitar país vazio', () => {
      const result = validator.validate({ ...minimalValidData(), country: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.country).toBe('País é obrigatório.');
    });
  });

  describe('Validação de Comentários', () => {
    it('deve aceitar comentários dentro do limite', () => {
      const result = validator.validate({
        ...minimalValidData(),
        comments: 'a'.repeat(300),
      });
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar comentários acima do limite', () => {
      const result = validator.validate({
        ...minimalValidData(),
        comments: 'a'.repeat(301),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.comments).toBe('Comentários não podem exceder 300 caracteres.');
    });

    it('deve aceitar ausência de comentários', () => {
      const { comments, ...data } = minimalValidData();
      const result = validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar comentários não-string', () => {
      const result = validator.validate({
        ...minimalValidData(),
        // Forçamos tipo incorreto sem depender de diretiva
        comments: 12345 as unknown as string,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.comments).toBe('Comentários devem ser texto.');
    });
  });

  describe('Validação Completa', () => {
    it('deve validar formulário totalmente válido', () => {
      const result = validator.validate({
        fullName: 'Maria José da Silva',
        email: 'maria.jose@example.com',
        birthDate: '1985-03-22',
        country: 'Brasil',
        comments: 'Ótimo serviço, recomendo!',
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve acumular múltiplos erros', () => {
      const result = validator.validate({
        fullName: 'Jo',
        email: 'invalid-email',
        birthDate: '2020-01-01',
        country: '',
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
      expect(result.errors).toHaveProperty('fullName');
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('birthDate');
      expect(result.errors).toHaveProperty('country');
    });
  });
});

// Função auxiliar para fornecer dados mínimos válidos
function minimalValidData(): FormData {
  return {
    fullName: 'João da Silva',
    email: 'valid@example.com',
    birthDate: '1990-01-01',
    country: 'Brasil',
  };
}
