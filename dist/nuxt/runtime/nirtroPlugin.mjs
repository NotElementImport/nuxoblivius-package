import { useAppConfig } from "#imports";
import { settings } from "nuxoblivius/dist/ts/Config.js";
export default function (nitroApp) {
    nitroApp.hooks.hook("request", (cont) => {
        const cookieSended = cont.req.rawHeaders.indexOf("cookie");
        let getGookie = (name) => null;
        if (cookieSended != -1) {
            const rawCookie = decodeURI(cont.req.rawHeaders[cookieSended + 1]).split(";").map((x) => x.trim().split("="));
            getGookie = (name) => {
                const cookie = rawCookie.find((x) => x[0] == name);
                if (cookie) {
                    return cookie[1];
                }
                return null;
            };
        }
        settings.cookieWorker({
            get(name) {
                return getGookie(name);
            },
            set(name, value) {
            }
        });
    });
}
;
