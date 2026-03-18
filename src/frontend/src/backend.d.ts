import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TextSection {
    key: string;
    content: string;
}
export interface UserProfile {
    name: string;
}
export interface ColorSettings {
    bgColor: string;
    titleColor: string;
    subtitleColor: string;
    heartColor: string;
    accentColor: string;
    navTextColor: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllSectionImages(): Promise<Array<[string, ExternalBlob]>>;
    getAllSections(): Promise<Array<TextSection>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getColorSettings(): Promise<ColorSettings>;
    getSection(key: string): Promise<TextSection | null>;
    getSectionImage(key: string): Promise<ExternalBlob | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeDefaultSections(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateColorSettings(settings: ColorSettings): Promise<void>;
    updateSection(key: string, content: string): Promise<void>;
    updateSectionImage(key: string, image: ExternalBlob): Promise<void>;
}
