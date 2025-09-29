// formValidator.test.ts
import { validateForm, normalizeFullName, COUNTRIES } from "./formValidator";

const validData = {
	fullName: "Juan Pérez",
	email: "juan@example.com",
	birthDate: "1990-01-01",
	country: "México",
	comments: "Todo bien, gracias.",
};

describe("validateForm - Nombre Completo (v3)", () => {
	it("should accept names with multiple spaces and normalize them", () => {
		const data = { ...validData, fullName: "Jose     da     Silva" };
		expect(validateForm(data).fullName).toBeUndefined();
	});

	it("should reject names with only spaces", () => {
		const data = { ...validData, fullName: "   " };
		expect(validateForm(data).fullName).toBeDefined();
	});

	it("should reject names with leading/trailing spaces only", () => {
		const data = { ...validData, fullName: "   Juan   " };
		// Esto debería pasar porque normalizamos y queda "Juan" → pero falla porque necesita al menos un espacio (nombre + apellido)
		expect(validateForm(data).fullName).toBeDefined();
	});

	it("should accept names with hyphens and apostrophes", () => {
		const data = { ...validData, fullName: "Mary-Jane O'Connor" };
		expect(validateForm(data).fullName).toBeUndefined();
	});

	it("should reject names with numbers", () => {
		const data = { ...validData, fullName: "Juan 123 Pérez" };
		expect(validateForm(data).fullName).toBeDefined();
	});
});

describe("validateForm - Email Domain Validation", () => {
	it("should reject email without TLD", () => {
		const data = { ...validData, email: "test@gmail" };
		expect(validateForm(data).email).toBeDefined();
	});

	it("should reject email with invalid TLD", () => {
		const data = { ...validData, email: "test@gmail.con" };
		expect(validateForm(data).email).toBeDefined();
	});

	it("should accept email with valid TLD", () => {
		const data = { ...validData, email: "test@gmail.com" };
		expect(validateForm(data).email).toBeUndefined();
	});

	it("should accept email with country TLD", () => {
		const data = { ...validData, email: "test@empresa.mx" };
		expect(validateForm(data).email).toBeUndefined();
	});

	it("should accept email with subdomain", () => {
		const data = { ...validData, email: "test@mail.google.com" };
		expect(validateForm(data).email).toBeUndefined();
	});

	it("should reject email with single character TLD", () => {
		const data = { ...validData, email: "test@gmail.a" };
		expect(validateForm(data).email).toBeDefined();
	});

	it("should reject email with numeric TLD", () => {
		const data = { ...validData, email: "test@gmail.123" };
		expect(validateForm(data).email).toBeDefined();
	});
});

describe("normalizeFullName function", () => {
	it("should normalize multiple spaces", () => {
		expect(normalizeFullName("Jose     da     Silva")).toBe(
			"Jose da Silva"
		);
	});

	it("should trim leading and trailing spaces", () => {
		expect(normalizeFullName("   Juan Pérez   ")).toBe("Juan Pérez");
	});

	it("should preserve single spaces between words", () => {
		expect(normalizeFullName("Juan Pérez García")).toBe(
			"Juan Pérez García"
		);
	});
});
