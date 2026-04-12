import { ValidationResult } from '../../Domain/types/ValidationResult';
import { VALIDATION } from '../../constants/validation';

export function validateCreatePost(title: string, content: string): ValidationResult {
    if (!title || title.trim().length < VALIDATION.POST_TITLE_MIN || title.trim().length > VALIDATION.POST_TITLE_MAX) {
        return { valid: false, message: `Title must be between ${VALIDATION.POST_TITLE_MIN} and ${VALIDATION.POST_TITLE_MAX} characters` };
    }
    if (!content || content.trim().length < VALIDATION.POST_CONTENT_MIN || content.trim().length > VALIDATION.POST_CONTENT_MAX) {
        return { valid: false, message: `Content must be between ${VALIDATION.POST_CONTENT_MIN} and ${VALIDATION.POST_CONTENT_MAX} characters` };
    }
    return { valid: true };
}