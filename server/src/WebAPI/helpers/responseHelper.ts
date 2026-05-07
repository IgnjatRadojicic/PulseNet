import { Response } from 'express';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { ServiceResult } from '../../Domain/types/ServiceResult';

const errorCodeToHttpStatus: Record<ErrorCode, number> = {
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.ALREADY_EXISTS]: 409,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

export function sendServiceResult<T>(
    res: Response,
    result: ServiceResult<T>,
    successStatus: number = 200
    ): void {
        if (result.success) {
            res.status(successStatus).json({success: true, data: result.data});
            return;
        }

        const httpStatus = result.errorCode
        ? errorCodeToHttpStatus[result.errorCode]
        : 500;

        res.status(httpStatus).json({success: false, message: result.message});
    }