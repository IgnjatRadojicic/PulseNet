import { ValidationResult } from '../../Domain/types/ValidationResult';
import { VALIDATION } from '../../constants/validation';

export function validateCreateComment(content: string): ValidationResult {
    if (!content || content.trim().length < VALIDATION.COMMENT_CONTENT_MIN || content.trim().length > VALIDATION.COMMENT_CONTENT_MAX) {
        return { valid: false, message: `Comment must be between ${VALIDATION.COMMENT_CONTENT_MIN} and ${VALIDATION.COMMENT_CONTENT_MAX} characters` };
    }
    return { valid: true };
}