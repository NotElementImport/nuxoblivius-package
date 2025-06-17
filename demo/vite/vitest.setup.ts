import { config } from '@vue/test-utils'

// Патч Vue 3 внутреннего $ инстанса
config.global.mocks = {
  devtoolsRawSetupState: {},
}
