import { StateComposition } from './dist/ts/compiler.js'
// import { state as s } from './dist/ts/index'
import m from './dist/ts/StateManager/index.js'
import f from './dist/ts/FormModel/index.js'

export const state = (value) => StateComposition.instruction(value)
export default m
export const FormModel = f