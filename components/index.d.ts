export declare namespace Inputs {
    export type FileAccess = ".mp4" | ".mp3" | ".flac" | ".avif" | ".avi" | ".wav" | ".jpg" | ".jpeg" | ".png" | ".gif" | ".bmp" | ".log" | ".txt" | ".webm" | ".pdf" | ".csv" | ".json" | "audio/*" | "video/*" | "image/*"
    export type InputType = "array" | "api" | "select" | "basic" | "number" | "checkbox" | "multiline" | "email" | "tel" | "files"
    export interface InputBasic {
        value: string,
        placeholder?: string
        maxLength?: number
        type?: string
    }
    export interface InputSelect {
        value: number,
        content: {[key: string]: any}[]
    }
    export interface InputNumber {
        value: number,
        maxLength?: number
        max?: number
        min?: number
    }
    export interface InputAlert {
        value: number,
        title: string,
        content: string|IStateApiOne<any>
    }
}