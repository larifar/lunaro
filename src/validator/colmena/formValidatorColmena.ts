// formValidatorColmena.ts

export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export interface FormData {
	fullName: string;
	email: string;
	birthDate: string | Date;
	country: string;
	comments?: string;
}

export type CountryList = readonly string[];

export class FormValidatorColmena {
	private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	private static readonly MIN_AGE_YEARS = 18;
	private static readonly MAX_COMMENTS_LENGTH = 300;
	private static readonly MIN_FULLNAME_LENGTH = 3;

	// Regex para nomes: letras, acentos, hífens, apóstrofos, espaços — nada de números ou símbolos
	private static readonly FULLNAME_VALID_CHARS_REGEX =
		/^[a-zA-ZÀ-ÿ\u00C0-\u017F\s'\-]+$/;

	// Lista de TLDs comuns e válidos (pode ser expandida ou carregada externamente)
	private static readonly VALID_TLDS = new Set([
		"com",
		"org",
		"net",
		"edu",
		"gov",
		"mil",
		"int",
		"br",
		"ar",
		"cl",
		"mx",
		"es",
		"pt",
		"fr",
		"de",
		"it",
		"uk",
		"ca",
		"au",
		"jp",
		"kr",
		"info",
		"biz",
		"name",
		"pro",
		"coop",
		"museum",
		"aero",
		"jobs",
		"travel",
		"mobi",
		"io",
		"ai",
		"co",
		"app",
		"dev",
		"xyz",
		"online",
		"store",
		"tech",
		"site",
		"cloud",
	]);

	// Lista de domínios comuns + correções de typos frequentes (para bloquear)
	private static readonly COMMON_EMAIL_DOMAINS = new Set([
		"gmail.com",
		"hotmail.com",
		"outlook.com",
		"yahoo.com",
		"icloud.com",
		"live.com",
		"aol.com",
		"protonmail.com",
		"zoho.com",
		"mail.com",
		"gmx.com",
		"yandex.com",
		"terra.com",
		"bol.com.br",
		"uol.com.br",
		"ig.com.br",
		"terra.com.br",
	]);

	private static readonly TYPO_DOMAIN_MAP: Record<string, string> = {
		"gmial.com": "gmail.com",
		"gamil.com": "gmail.com",
		"gmail.con": "gmail.com",
		"gmail.co": "gmail.com",
		"hotnail.com": "hotmail.com",
		"hotnail.con": "hotmail.com",
		"hotmal.com": "hotmail.com",
		"outloook.com": "outlook.com",
		"yaho.com": "yahoo.com",
		"yaho.com.br": "yahoo.com.br",
		"uol.com": "uol.com.br",
		"ig.com": "ig.com.br",
	};

	private readonly allowedCountries: CountryList;

	constructor(allowedCountries: CountryList) {
		if (!Array.isArray(allowedCountries) || allowedCountries.length === 0) {
			throw new Error(
				"Lista de países permitidos é obrigatória e não pode estar vazia."
			);
		}
		this.allowedCountries = allowedCountries;
	}

	public validate(data: FormData): ValidationResult {
		const errors: Record<string, string> = {};

		this.validateFullName(data.fullName, errors);
		this.validateEmail(data.email, errors);
		this.validateBirthDate(data.birthDate, errors);
		this.validateCountry(data.country, errors);
		this.validateComments(data.comments, errors);

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	}

	private validateFullName(
		fullName: unknown,
		errors: Record<string, string>
	): void {
		if (typeof fullName !== "string") {
			errors.fullName = "Nome completo deve ser uma string.";
			return;
		}

		// Normaliza: remove espaços extras
		const normalized = fullName.trim().replace(/\s+/g, " ");

		if (normalized.length < FormValidatorColmena.MIN_FULLNAME_LENGTH) {
			errors.fullName = `Nome completo deve ter no mínimo ${FormValidatorColmena.MIN_FULLNAME_LENGTH} caracteres após normalização.`;
			return;
		}

		if (normalized.split(" ").length < 2) {
			errors.fullName =
				"Nome completo deve conter pelo menos nome e sobrenome.";
			return;
		}

		// Valida caracteres permitidos
		if (!FormValidatorColmena.FULLNAME_VALID_CHARS_REGEX.test(normalized)) {
			errors.fullName =
				"Nome completo contém caracteres inválidos. Use apenas letras, acentos, hífens, apóstrofos e espaços.";
			return;
		}

		// Impede nomes como "----" ou "''" ou "    "
		if (!/[a-zA-ZÀ-ÿ\u00C0-\u017F]/.test(normalized)) {
			errors.fullName = "Nome deve conter ao menos uma letra válida.";
			return;
		}
	}

	private validateEmail(
		email: unknown,
		errors: Record<string, string>
	): void {
		if (typeof email !== "string") {
			errors.email = "Email deve ser uma string.";
			return;
		}

		const trimmed = email.trim();

		if (trimmed.length === 0) {
			errors.email = "Email é obrigatório.";
			return;
		}

		if (!FormValidatorColmena.EMAIL_REGEX.test(trimmed)) {
			errors.email = "Formato de email inválido.";
			return;
		}

		const [localPart, domainPart] = trimmed.split("@");
		const lowerDomain = domainPart.toLowerCase();

		// 1. Verifica typo
		if (FormValidatorColmena.TYPO_DOMAIN_MAP[lowerDomain]) {
			const correct = FormValidatorColmena.TYPO_DOMAIN_MAP[lowerDomain];
			errors.email = `Domínio "${domainPart}" parece incorreto. Você quis dizer: ${correct}?`;
			return;
		}

		// 2. Verifica TLD
		const tld = domainPart.split(".").pop()?.toLowerCase();
		if (!tld || !FormValidatorColmena.VALID_TLDS.has(tld)) {
			errors.email = "Domínio de email inválido ou TLD não reconhecido.";
			return;
		}

		// 3. Verifica plausibilidade (só se TLD for válido)
		const isPlausibleDomain =
			FormValidatorColmena.COMMON_EMAIL_DOMAINS.has(lowerDomain) ||
			/^[a-zA-Z0-9][a-zA-Z0-9\-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(
				domainPart
			);

		if (!isPlausibleDomain) {
			errors.email =
				"Domínio de email não reconhecido ou inválido. Use um provedor real.";
			return;
		}
	}

	private validateBirthDate(
		birthDate: unknown,
		errors: Record<string, string>
	): void {
		let date: Date | null = null;

		if (birthDate instanceof Date) {
			date = birthDate;
		} else if (typeof birthDate === "string") {
			date = this.parseDateString(birthDate);
		}

		if (!date || isNaN(date.getTime())) {
			errors.birthDate =
				"Data de nascimento inválida ou em formato não suportado.";
			return;
		}

		const today = new Date();
		const eighteenYearsAgo = new Date();
		eighteenYearsAgo.setFullYear(
			today.getFullYear() - FormValidatorColmena.MIN_AGE_YEARS
		);

		if (date > eighteenYearsAgo) {
			errors.birthDate = `Você deve ter pelo menos ${FormValidatorColmena.MIN_AGE_YEARS} anos de idade.`;
			return;
		}

		if (date.getFullYear() < 1900) {
			errors.birthDate =
				"Data de nascimento muito antiga (antes de 1900).";
			return;
		}
	}

	private parseDateString(dateStr: string): Date | null {
		const trimmed = dateStr.trim();

		if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
			return new Date(trimmed);
		}

		const parts = trimmed.split("/");
		if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
			const [day, month, year] = parts.map(Number);
			const date = new Date(year, month - 1, day);
			if (
				date.getDate() === day &&
				date.getMonth() === month - 1 &&
				date.getFullYear() === year
			) {
				return date;
			}
		}

		return null;
	}

	private validateCountry(
		country: unknown,
		errors: Record<string, string>
	): void {
		if (typeof country !== "string") {
			errors.country = "País deve ser uma string.";
			return;
		}

		const trimmed = country.trim();

		if (trimmed.length === 0) {
			errors.country = "País é obrigatório.";
			return;
		}

		if (!this.allowedCountries.includes(trimmed)) {
			errors.country = "País não permitido ou inválido.";
			return;
		}
	}

	private validateComments(
		comments: unknown,
		errors: Record<string, string>
	): void {
		if (comments === undefined || comments === null) {
			return;
		}

		if (typeof comments !== "string") {
			errors.comments = "Comentários devem ser texto.";
			return;
		}

		if (comments.length > FormValidatorColmena.MAX_COMMENTS_LENGTH) {
			errors.comments = `Comentários não podem exceder ${FormValidatorColmena.MAX_COMMENTS_LENGTH} caracteres.`;
			return;
		}
	}
}
