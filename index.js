import { StateComposition } from './dist/ts/compiler.js'
// import { state as s } from './dist/ts/index'
import m from './dist/ts/StateManager/index.js'
import f from './dist/ts/FormModel/index.js'
import { setCustomFetch as _1, setCustomRouter as _2, setCustomCookie as _3, setHeaders as _4, EmulationRobots as _5 } from './dist/ts/config.js'

export const state = (value) => StateComposition.instruction(value)
export const molecula = (value) => StateComposition.instruction(value)
export default m
export const FormModel = f

export const setCustomFetch = _1
export const setCustomRouter = _2
export const setCustomCookie = _3
export const setHeaders = _4
export const EmulateRobots = _5