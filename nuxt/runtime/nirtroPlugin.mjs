import { useAppConfig } from "#imports";
import { settings } from "nuxoblivius/dist/ts/Config";
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (cont) => {
    console.log("REQUEST =>");
    console.log(cont.req.rawHeaders);
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
    settings.apiRoot(useAppConfig().nuxoblivius.api).isServer(true);
  });
  console.log("CONFIG NITRO SET =>");
});
