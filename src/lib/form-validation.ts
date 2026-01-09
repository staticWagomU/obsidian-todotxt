/**
 * Form validation logic
 * Validates task form data (description required, date format validation)
 */

export interface TaskFormData {
	description: string;
	priority?: string;
	creationDate?: string;
	due?: string;
	threshold?: string;
	projects?: string[];
	contexts?: string[];
	tags?: Record<string, string>;
}

export interface ValidationErrors {
	description?: string;
	creationDate?: string;
	due?: string;
	threshold?: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationErrors;
}

const ERROR_MESSAGES = {
	DESCRIPTION_REQUIRED: "説明文は必須です",
	INVALID_DATE_FORMAT: "無効な日付形式です (YYYY-MM-DD)",
} as const;

/**
 * Validate task form data
 * Returns validation result with errors
 */
export function validateTaskForm(formData: TaskFormData): ValidationResult {
	const errors: ValidationErrors = {};

	// Validate description (required)
	const trimmedDescription = formData.description.trim();
	if (trimmedDescription.length === 0) {
		errors.description = ERROR_MESSAGES.DESCRIPTION_REQUIRED;
	}

	// Validate date format (YYYY-MM-DD)
	const dateFields: Array<keyof Pick<TaskFormData, "creationDate" | "due" | "threshold">> = [
		"creationDate",
		"due",
		"threshold",
	];
	for (const field of dateFields) {
		const dateValue = formData[field];
		if (dateValue && !isValidDateFormat(dateValue)) {
			errors[field] = ERROR_MESSAGES.INVALID_DATE_FORMAT;
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
	};
}

/**
 * Validate date format (YYYY-MM-DD)
 * Returns true if the date is valid
 */
function isValidDateFormat(dateString: string): boolean {
	// Check format with regex
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateString)) {
		return false;
	}

	// Check if the date is valid (not just format)
	const date = new Date(dateString);
	const [year, month, day] = dateString.split("-").map(Number);

	// Validate year, month, day ranges
	if (
		year === undefined ||
		month === undefined ||
		day === undefined ||
		date.getFullYear() !== year ||
		date.getMonth() + 1 !== month ||
		date.getDate() !== day
	) {
		return false;
	}

	return true;
}
