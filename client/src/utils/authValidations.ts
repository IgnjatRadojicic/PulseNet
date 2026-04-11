import { VALIDATION } from '../constants/validation';


export interface RegisterForm {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    bio: string;
}


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).+$/;
const USERNAME_RE = /^[a-zA-Z0-9-]+$/;


export function validateLogin(username: string, password: string): string | null {
    const u = username.trim();
    if (!u || u.length < VALIDATION.USERNAME_MIN)
        return `Username must be at least ${VALIDATION.USERNAME_MIN} characters`;
    if (!password || password.length < VALIDATION.PASSWORD_MIN)
        return `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`;
    return null;
}

export function validateRegister(form: RegisterForm): string | null {
    const u = form.username.trim();
    if (!u || u.length < VALIDATION.USERNAME_MIN || u.length > VALIDATION.USERNAME_MAX)
        return `Username must be between ${VALIDATION.USERNAME_MIN} and ${VALIDATION.USERNAME_MAX} characters`;
    if (!USERNAME_RE.test(u))
        return 'Username may only contain letters, numbers, and hyphens';

    if (!form.email || !EMAIL_RE.test(form.email) || form.email.length < VALIDATION.EMAIL_MIN)
        return 'Email address is not valid';

    const fn = form.firstName.trim();
    if (!fn || fn.length < VALIDATION.FIRST_NAME_MIN || fn.length > VALIDATION.FIRST_NAME_MAX)
        return `First name must be between ${VALIDATION.FIRST_NAME_MIN} and ${VALIDATION.FIRST_NAME_MAX} characters`;

    const ln = form.lastName.trim();
    if (!ln || ln.length < VALIDATION.LAST_NAME_MIN || ln.length > VALIDATION.LAST_NAME_MAX)
        return `Last name must be between ${VALIDATION.LAST_NAME_MIN} and ${VALIDATION.LAST_NAME_MAX} characters`;

    if (!form.password || form.password.length < VALIDATION.PASSWORD_MIN)
        return `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`;
    if (!PASSWORD_RE.test(form.password))
        return 'Password must contain at least one uppercase letter and one number';

    if (form.password !== form.confirmPassword)
        return 'Passwords do not match';

    if (form.bio && form.bio.length > VALIDATION.BIO_MAX)
        return `Bio must not exceed ${VALIDATION.BIO_MAX} characters`;

    return null;
}