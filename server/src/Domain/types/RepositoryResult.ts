

export type ResultReason = 'not_found' | 'failure';

//  Discriminated union 

interface SuccessResult<T> {
    ok: true;
    data: T;
}

interface ErrorResult {
    ok: false;
    reason: ResultReason;
    message: string;
}

export type RepositoryResult<T> = SuccessResult<T> | ErrorResult;

//  Factory helpers (static-style, keeps repo code concise) 

export const RepositoryResult = {

    success<T>(data: T): RepositoryResult<T> {
        return { ok: true, data };
    },

    notFound(message: string = 'Entity not found'): RepositoryResult<never> {
        return { ok: false, reason: 'not_found', message };
    },

    failure(message: string = 'Repository operation failed'): RepositoryResult<never> {
        return { ok: false, reason: 'failure', message };
    },
};
