import SM, { useStore } from "./ts/index.js";

export default function useStoreTest() {
    return useStore<Test>('test', Test)
}

class Test extends SM {
    public myVal = 2
    public myAnother = this.static(5)

    public get myComputed() {
        return this.myVal + this.myAnother
    }
}

const testS = useStoreTest()

console.log(testS.myAnother)
console.log(testS.myVal)
console.log(testS.myComputed)