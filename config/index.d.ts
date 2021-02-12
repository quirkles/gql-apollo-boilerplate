export interface AppConfig {
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    ENCRYPTION_IV: string;

    LOG_TO_FILE: boolean;

    PORT: string;
}
export const config: AppConfig;
export const getConfig: (overrides: Partial<AppConfig>) => AppConfig;
