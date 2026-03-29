import { ValidationResult } from '../../Domain/types/ValidationResult';

export function validateProfileUpdate(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    bio?: string
): ValidationResult {
    if (!username || username.trim().length < 3 || username.trim().length > 40) {
        return { valid: false, message: 'Username must be between 3 and 40 characters' };
    }
    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
        return { valid: false, message: 'Username can only contain letters, numbers and hyphens' };
    }
    if (!email || !email.includes('@') || email.length < 5) {
        return { valid: false, message: 'Invalid email address' };
    }
    if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50) {
        return { valid: false, message: 'First name must be between 2 and 50 characters' };
    }
    if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 50) {
        return { valid: false, message: 'Last name must be between 2 and 50 characters' };
    }
    if (bio && bio.length > 300) {
        return { valid: false, message: 'Bio cannot exceed 300 characters' };
    }
    return { valid: true };
}