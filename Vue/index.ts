import { config  } from '../index'
import { ref, AppContext } from 'vue'

export default {
    install(app: AppContext, options: {[key: string]: any}) {
        config.reactiveInstance = (value: any) => ref(value)
        config.reactiveGet = (object: any) => object.value
        config.reactiveSet = (object: any, value: any) => {object.value = value}
    }
}