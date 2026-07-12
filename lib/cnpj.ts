const firstDigitWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const secondDigitWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function normalizeCnpj(value: string) {
	const characters = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

	return `${characters.slice(0, 12)}${characters.slice(12).replace(/[^0-9]/g, "").slice(0, 2)}`;
}

function cnpjCharacterValue(character: string) {
	return character.charCodeAt(0) - 48;
}

function calculateCheckDigit(value: string, weights: number[]) {
	const total = [...value].reduce((sum, character, index) => {
		return sum + cnpjCharacterValue(character) * weights[index];
	}, 0);
	const digit = 11 - (total % 11);

	return digit >= 10 ? 0 : digit;
}

export function isValidCnpj(value: string) {
	const cnpj = normalizeCnpj(value);

	if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) {
		return false;
	}

	const firstDigit = calculateCheckDigit(cnpj.slice(0, 12), firstDigitWeights);
	const secondDigit = calculateCheckDigit(cnpj.slice(0, 12) + firstDigit, secondDigitWeights);

	return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}

export function formatCnpj(value: string) {
	const cnpj = normalizeCnpj(value);

	if (!cnpj) {
		return "";
	}

	if (cnpj.length <= 2) {
		return cnpj;
	}

	if (cnpj.length <= 5) {
		return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
	}

	if (cnpj.length <= 8) {
		return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
	}

	if (cnpj.length <= 12) {
		return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
	}

	return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}
