import { defineFactory } from "./index.js";

const Circle = defineFactory(({ mut, scoped }, [ radius ]) => {
    const commit = () => {
        halfRadius.value = radius.value * 0.5
    }

    const halfRadius = scoped(0)

    radius = mut(radius ?? 16).change(commit)
    
    return commit(), {
        radius,
        halfRadius
    }
})

const c1 = Circle([ 32 ])