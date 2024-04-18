
import type { ModuleOptions } from './module'


declare module '@nuxt/schema' {
  interface NuxtConfig { ['nuxoblivius']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['nuxoblivius']?: ModuleOptions }
}

declare module 'nuxt/schema' {
  interface NuxtConfig { ['nuxoblivius']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['nuxoblivius']?: ModuleOptions }
}


export type { ModuleOptions, default } from './module'
