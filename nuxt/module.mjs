import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "nuxoblivius-nuxt",
    configKey: "nuxoblivius"
  },
  // Default configuration options of the Nuxt module
  defaults: {
    rules: {},
    logs:  false,
  },
  // hooks: {
  // }
  setup(_options, _nuxt) {
    console.log(' ')
    console.log(' ✅ Nuxt > Nuxoblivius start ')
    console.log(' ')

    const resolver = createResolver(import.meta.url);

    _nuxt.options.appConfig.nuxoblivius = {
      rules: _options.rules,
      logs : _options.logs,
    };

    _nuxt.hook("nitro:config", (nitro) => {
      nitro.plugins = nitro.plugins || [];
      nitro.plugins.push(resolver.resolve("./runtime/nirtroPlugin"));
    });
    addPlugin({
      order: -Infinity,
      mode: "all",
      src: resolver.resolve("./runtime/01.plugin")
    });
  }
});

export { module as default };
