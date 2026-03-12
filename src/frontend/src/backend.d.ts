import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Section {
    key: string;
    content: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllSections(): Promise<Array<Section>>;
    getCallerUserRole(): Promise<UserRole>;
    getSection(key: string): Promise<Section | null>;
    initializeDefaultSections(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    updateSection(key: string, content: string): Promise<void>;
}
