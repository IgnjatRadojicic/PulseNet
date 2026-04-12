import { ValidationResult } from '../../Domain/types/ValidationResult';
import { VALIDATION } from '../../constants/validation';

export function validateCreateCommunity(name: string, description?: string, type?: string): ValidationResult {
    if (!name || name.trim().length < VALIDATION.COMMUNITY_NAME_MIN || name.trim().length > VALIDATION.COMMUNITY_NAME_MAX) {
        return { valid: false, message: `Community name must be between ${VALIDATION.COMMUNITY_NAME_MIN} and ${VALIDATION.COMMUNITY_NAME_MAX} characters` };
    }
    if (description && description.length > VALIDATION.COMMUNITY_DESCRIPTION_MAX) {
        return { valid: false, message: `Description cannot exceed ${VALIDATION.COMMUNITY_DESCRIPTION_MAX} characters` };
    }
    if (type && !['public', 'private'].includes(type)) {
        return { valid: false, message: 'Type must be public or private' };
    }
    return { valid: true };
}