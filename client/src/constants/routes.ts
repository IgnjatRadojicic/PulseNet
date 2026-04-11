export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FEED: '/feed',
    ADMIN_DASHBOARD: '/admin-dashboard',
    NOT_FOUND: '/404',
    COMMUNITY: (id: number) => `/community/${id}`,
    POST: (id: number) => `/post/${id}`,
    PROFILE: (username: string) => `/profile/${username}`,
} as const;