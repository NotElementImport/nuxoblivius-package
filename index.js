import { StateComposition } from './dist/ts/compiler'
// import { state as s } from './dist/ts/index'
import m from './dist/ts/StateManager/index'
import f from './dist/ts/FormModel/index'

export const state = (value) => StateComposition.instruction(value)
export default m
export const FormModel = f