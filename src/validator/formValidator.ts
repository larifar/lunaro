// formValidator.ts — Versión 3.0

export interface IFormData {
	fullName: string;
	email: string;
	birthDate: string; // ISO Date String "YYYY-MM-DD"
	country: string;
	comments?: string;
}

export interface IValidationErrors {
	fullName?: string;
	email?: string;
	birthDate?: string;
	country?: string;
	comments?: string;
}

export const COUNTRIES = [
	"México",
	"España",
	"Colombia",
	"Argentina",
	"Chile",
	"Perú",
	"Brasil",
	"Estados Unidos",
	"Canadá",
	"Alemania",
	"Francia",
	"Italia",
	"Reino Unido",
	"Japón",
	"Corea del Sur",
	"Australia",
] as const;

export type Country = (typeof COUNTRIES)[number];

/**
 * Normaliza espacios múltiples en un string
 */
const normalizeSpaces = (str: string): string => {
	return str.trim().replace(/\s+/g, " ");
};

/**
 * Valida que el nombre:
 * - Tenga al menos 3 caracteres después de normalizar
 * - Contenga al menos un espacio (nombre + apellido)
 * - Solo contenga letras, acentos, ñ, guiones, apóstrofes y espacios
 * - Espacios múltiples son normalizados y aceptados
 */
const isValidFullName = (name: string): boolean => {
	if (!name) return false;

	// 👇 NORMALIZA PRIMERO — ANTES DE CUALQUIER VALIDACIÓN
	const normalized = normalizeSpaces(name);
	if (normalized.length < 3) return false;

	// Debe contener al menos un espacio (nombre y apellido)
	if (!normalized.includes(" ")) return false;

	// Solo permite letras, acentos, ñ, apóstrofe, guion y espacios
	const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/;
	return nameRegex.test(normalized); // 👈 VALIDA SOBRE EL NOMBRE NORMALIZADO
};

/**
 * Lista de TLDs comunes (puede extenderse)
 */
const VALID_TLDS = new Set([
	// Genéricos
	"com",
	"org",
	"net",
	"edu",
	"gov",
	"mil",
	"int",
	"info",
	"biz",
	"name",
	"pro",
	"coop",
	"aero",
	"museum",
	"jobs",
	"mobi",
	"travel",
	"cat",
	"post",
	"tel",
	"asia",
	"xxx",
	// Países
	"mx",
	"es",
	"co",
	"ar",
	"cl",
	"pe",
	"br",
	"us",
	"ca",
	"de",
	"fr",
	"it",
	"uk",
	"jp",
	"kr",
	"au",
	"nz",
	"ru",
	"cn",
	"in",
	"za",
	"sg",
	"ae",
	"sa",
	"tr",
	"pl",
	"nl",
	"se",
	"ch",
	"at",
	"be",
	"dk",
	"fi",
	"no",
	"pt",
	"gr",
	"ie",
	"cz",
	"hu",
	"ro",
	"sk",
	"si",
	"hr",
	"bg",
	"rs",
	"ua",
	"by",
	"kz",
	"uz",
	"vn",
	"th",
	"ph",
	"my",
	"id",
	"bd",
	"pk",
	"lk",
	"np",
	"mm",
	"kh",
	"la",
	"bn",
	"tl",
	"pg",
	"sb",
	"vu",
	"fj",
	"to",
	"ws",
	"ki",
	"fm",
	"pw",
	"mh",
	"nr",
	"tv",
	"cc",
	"cx",
	"gs",
	"tk",
	"nu",
	"nf",
	"pm",
	"wf",
	"yt",
	"re",
	"sh",
	"ac",
	"ta",
	"io",
	"vg",
	"vi",
	"pr",
	"gu",
	"mp",
	"as",
	"um",
	"tc",
	"ky",
	"bm",
	"ag",
	"lc",
	"vc",
	"gd",
	"dm",
	"bb",
	"bz",
	"cr",
	"sv",
	"gt",
	"hn",
	"ni",
	"pa",
	"py",
	"uy",
	"bo",
	"ec",
	"ve",
	"sr",
	"gy",
	"gf",
	"aw",
	"mq",
	"gp",
	"ht",
	"do",
	"cu",
	"jm",
	"bs",
	"tt",
	"kn",
	"lc",
	"vc",
	"ag",
	"dm",
	"gd",
	"bb",
	"bz",
	"cr",
	"sv",
	"gt",
	"hn",
	"ni",
	"pa",
	"py",
	"uy",
	"bo",
	"ec",
	"ve",
	"sr",
	"gy",
	"gf",
	"aw",
	"mq",
	"gp",
	"ht",
	"do",
	"cu",
	"jm",
	"bs",
	"tt",
	"kn",
]);

/**
 * Valida que el email tenga un dominio con TLD válido
 */
const isValidEmailDomain = (email: string): boolean => {
	const atIndex = email.lastIndexOf("@");
	if (atIndex === -1) return false;

	const domain = email.slice(atIndex + 1);
	const lastDotIndex = domain.lastIndexOf(".");

	if (lastDotIndex === -1) return false; // No hay punto en el dominio

	const tld = domain.slice(lastDotIndex + 1).toLowerCase();
	return VALID_TLDS.has(tld) && tld.length >= 2;
};

/**
 * Valida que la fecha:
 * - Sea un string con formato YYYY-MM-DD
 * - Represente una fecha real (no 2023-02-30)
 * - Esté en el pasado (no hoy ni futuro)
 */
const isValidPastDate = (dateStr: string): boolean => {
	if (!dateStr) return false;

	// Verifica formato ISO básico
	const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!isoRegex.test(dateStr)) return false;

	const date = new Date(dateStr);

	// Verifica si la fecha es válida (no NaN)
	if (isNaN(date.getTime())) return false;

	// Verifica que la conversión no haya cambiado el string (evita fechas como 2023-02-30)
	const [year, month, day] = dateStr.split("-").map(Number);
	if (
		date.getFullYear() !== year ||
		date.getMonth() + 1 !== month ||
		date.getDate() !== day
	) {
		return false;
	}

	// Verifica que sea en el pasado (no hoy ni futuro)
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Normalizamos a medianoche
	date.setHours(0, 0, 0, 0);

	return date < today;
};

export const validateForm = (data: IFormData): IValidationErrors => {
	const errors: IValidationErrors = {};

	// Validar nombre completo
	if (!data.fullName || !isValidFullName(data.fullName)) {
		errors.fullName =
			"El nombre completo debe incluir nombre y apellido, y solo puede contener letras, acentos, guiones, apóstrofes y espacios. Espacios múltiples serán normalizados.";
	}

	// Validar email
	const basicEmailRegex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

	if (!data.email) {
		errors.email = "El correo electrónico es obligatorio.";
	} else if (!basicEmailRegex.test(data.email)) {
		errors.email = "El correo electrónico no tiene un formato válido.";
	} else if (!isValidEmailDomain(data.email)) {
		errors.email =
			"El dominio del correo electrónico no es válido. Debe tener un TLD válido (ej: .com, .mx, .org).";
	}

	// Validar fecha de nacimiento
	if (!data.birthDate) {
		errors.birthDate = "La fecha de nacimiento es obligatoria.";
	} else if (!isValidPastDate(data.birthDate)) {
		errors.birthDate =
			"La fecha de nacimiento debe ser una fecha válida en el pasado.";
	} else {
		// Si la fecha es válida, verificar que sea mayor de 18 años
		const birthDate = new Date(data.birthDate);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		const dayDiff = today.getDate() - birthDate.getDate();

		if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
			age--;
		}

		if (age < 18) {
			errors.birthDate = "Debes tener al menos 18 años para registrarte.";
		}
	}

	// Validar país
	if (!data.country || !COUNTRIES.includes(data.country as Country)) {
		errors.country = "Selecciona un país válido de la lista.";
	}

	// Validar comentarios (opcional, máximo 300 caracteres)
	if (data.comments && data.comments.length > 300) {
		errors.comments =
			"Los comentarios no pueden exceder los 300 caracteres.";
	}

	return errors;
};

// ✅ Función auxiliar: ¿formulario válido?
export const isFormValid = (data: IFormData): boolean => {
	const errors = validateForm(data);
	return Object.keys(errors).length === 0;
};

// ✅ Función auxiliar: Normalizar nombre (para almacenamiento)
export const normalizeFullName = (name: string): string => {
	return normalizeSpaces(name);
};
