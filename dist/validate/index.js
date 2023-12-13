import ValidateMessage from "./ValidateMessages.js";
export default class IValidate {
    static messageText = "email";
    static getMessageText() { return "email"; }
    static getMessage(...fields) { return ValidateMessage.message(this.messageText, ...fields); }
    static behaviour(value = null, ...args) { return true; }
}
