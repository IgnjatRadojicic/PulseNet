import { ValidationResult } from '../../Domain/types/ValidationResult';
import { VALIDATION } from '../../constants/validation';

export function validateLogin(username: string, password: string): ValidationResult {
    if (!username || username.trim().length < VALIDATION.USERNAME_MIN) {
        return { valid: false, message: `Username must be at least ${VALIDATION.USERNAME_MIN} characters` };
    }
    if (!password || password.length < VALIDATION.PASSWORD_MIN) {
        return { valid: false, message: `Password must be at least ${VALIDATION.PASSWORD_MIN} characters` };
    }
    return { valid: true };
}

export function validateRegister(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    bio?: string
): ValidationResult {
    if (!username || username.trim().length < VALIDATION.USERNAME_MIN || username.trim().length > VALIDATION.USERNAME_MAX) {
        return { valid: false, message: `Username must be between ${VALIDATION.USERNAME_MIN} and ${VALIDATION.USERNAME_MAX} characters` };
    }
    if (!VALIDATION.USERNAME_PATTERN.test(username)) {
        return { valid: false, message: 'Username can only contain letters, numbers and hyphens' };
    }
    if (!email || !email.includes('@') || email.length < VALIDATION.EMAIL_MIN) {
        return { valid: false, message: 'Invalid email address' };
    }
    if (!firstName || firstName.trim().length < VALIDATION.FIRST_NAME_MIN || firstName.trim().length > VALIDATION.FIRST_NAME_MAX) {
        return { valid: false, message: `First name must be between ${VALIDATION.FIRST_NAME_MIN} and ${VALIDATION.FIRST_NAME_MAX} characters` };
    }
    if (!lastName || lastName.trim().length < VALIDATION.LAST_NAME_MIN || lastName.trim().length > VALIDATION.LAST_NAME_MAX) {
        return { valid: false, message: `Last name must be between ${VALIDATION.LAST_NAME_MIN} and ${VALIDATION.LAST_NAME_MAX} characters` };
    }
    if (!password || password.length < VALIDATION.PASSWORD_MIN) {
        return { valid: false, message: `Password must be at least ${VALIDATION.PASSWORD_MIN} characters` };
    }
    if (!VALIDATION.PASSWORD_PATTERN.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter and one number' };
    }
    if (bio && bio.length > VALIDATION.BIO_MAX) {
        return { valid: false, message: `Bio cannot exceed ${VALIDATION.BIO_MAX} characters` };
    }
    return { valid: true };
}