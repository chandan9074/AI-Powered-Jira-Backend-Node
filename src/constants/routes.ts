export const API_VERSION = '/api/v1';

export const ROUTES = {
    
    AUTH: {
        BASE: '/auth',
        REGISTER: '/register',
        LOGIN: '/login',
        REQUEST_OTP: '/request-otp',
        REFRESH: '/refresh',
        CSRF_TOKEN: '/csrf-token',
        // We pre-calculate the exact cookie path so we never get it wrong
        get COOKIE_REFRESH_PATH() {
        return `${API_VERSION}${this.BASE}${this.REFRESH}`;
        }
    }
} as const;