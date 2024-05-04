import { useAppConfig } from "#imports";
import { settings } from "nuxoblivius/dist/ts/Config.js";
import { hydrateDataFromStores } from "nuxoblivius/dist/ts/index.js";
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
        // nitroApp.hooks.hook("render:response", (data) => {
        //   const toStringFunction = (func = () => {}) => {
        //     const stringFunc = func.toString()
        //     return stringFunc.slice(stringFunc.indexOf("{") + 1, stringFunc.lastIndexOf('}') - 1)
        //   }
        //   let hydrationInfo = hydrateDataFromStores()
        //   let logic = toStringFunction(() => {
        //     if(!window.__NUXOBLIVIUS_HYDRATION__) {window.__NUXOBLIVIUS_HYDRATION__ = {}}
        //   })
        //   logic = logic.replace('{}', hydrationInfo)
        //   data.body = data.body.replace(
        //     '</head>', 
        //     '<script>' + logic + '</script></head>')
        // });
        settings.apiRoot(useAppConfig().nuxoblivius.api).isServer(true);
    });
}
;
