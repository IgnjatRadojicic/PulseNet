import { ErrorCode } from '../enums/ErrorCode';

export type ServiceResult<T> = {
    success: boolean;
    data?: T;
    message?: string;
    errorCode?: ErrorCode;
};
