import ValidateMessage from "./ValidateMessages.js";

export default class IValidate {
    protected static messageText = "email"
    protected static getMessageText() { return "email" } 
    public static getMessage(...fields: any[]): string { return ValidateMessage.message(this.messageText as any, ...fields)}
    public static behaviour(value: any = null, ...args: any[]): boolean { return true; }
}