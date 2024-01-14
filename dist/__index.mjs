import SM, { useStore } from "./ts/index.js";
export default function useStoreTest() {
    return useStore('test', Test);
}
class Test extends SM {
    myVal = 2;
    myAnother = this.static(5);
    get myComputed() {
        return this.myVal + this.myAnother;
    }
}
const testS = useStoreTest();
console.log(testS.myAnother);
console.log(testS.myVal);
console.log(testS.myComputed);
