
import validator from 'validator';

export const validate = (data) => {
    // 1. Ensure the data object exists
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Request body is empty or missing");
    }

    // 2. Enforce presence of mandatory registration fields
    const mandatoryFields = ['firstName', 'lastName', 'email', 'password'];
    const hasAllFields = mandatoryFields.every((field) => Object.keys(data).includes(field));

    if (!hasAllFields) {
        throw new Error("Missing mandatory fields. (name, email, and password are required)");
    }

    // 3. Validate email formatting (Fixed to use 'email' instead of 'emailId')
    if (!validator.isEmail(data.email)) {
        throw new Error("Invalid email format");
    }

    // 4. Validate password strength
    // Kept minSymbols: 0 for easy local testing as you configured
    if (!validator.isStrongPassword(data.password, { minSymbols: 0 })) {
        throw new Error("Password must be at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol ");
    }
};