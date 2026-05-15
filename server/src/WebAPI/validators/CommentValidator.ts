import { ValidationResult } from "../../Domain/types/ValidationResult";

export function validateCommentContent(content: string, parentId: number | null): ValidationResult {
    if (!content || content.trim().length === 0 || content.trim().length < 1 || content.trim().length > 2000) {
        return { valid: false, message: 'Content must be between 1 and 2000 characters' };
    }

    if(parentId !== null && (isNaN(parentId) || parentId < 0)) {
        return { valid: false, message: 'Invalid parent comment ID' };
    }

    return { valid: true};
}