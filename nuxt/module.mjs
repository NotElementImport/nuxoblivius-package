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

    if(!_nuxt.options.vite)
      _nuxt.options.vite = { optimizeDeps: { exclude: ['nuxoblivius'] } }
    else if(!_nuxt.options.vite.optimizeDeps)
      _nuxt.options.vite.optimizeDeps = { exclude: ['nuxoblivius'] }
    else if(!_nuxt.options.vite.optimizeDeps.exclude)
      _nuxt.options.vite.optimizeDeps.exclude = ['nuxoblivius']
    else
      _nuxt.options.vite.optimizeDeps.exclude.push('nuxoblivius')

    if(!_nuxt.options.routeRules)
      _nuxt.options.routeRules = {}

    for (const [rule, url] of Object.entries(_options.rules)) {
      _nuxt.options.routeRules[rule+'/**'] = {
        proxy: url+'/**'
      }
    }

    _nuxt.options.appConfig.nuxoblivius = {
      rules: _options.rules,
      logs : _options.logs,
    };

    addPlugin({
      order: -Infinity,
      mode: "all",
      src: resolver.resolve("./runtime/01.plugin")
    });
  }
});

export { module as default };
