// import { computed, shallowRef } from "vue";
// import { CalcRef, CalcRefConfig } from "../@types.composables.js";
//
// export const useRelationCalcRef = <T>(handle: (abortSignal: AbortSignal) => (T | Promise<T>)) => {
//   var abortController = new AbortController();
//
//   const calcRef = useCalcRef<T>(() => handle(abortController.signal), { immidiate: false });
//
//   return computed(() => {
//     abortController.abort();
//     abortController = new AbortController();
//
//     return calcRef.update().value;
//   });
// };
//
// export const useCalcRef = <T>(handle: () => (T | Promise<T>), config: CalcRefConfig = {}) => {
//   const calcRef = shallowRef<T>() as CalcRef<T>;
//   var actualIndex = Date.now();
//
//   calcRef.update = () => {
//     const response = handle();
//
//     if (response instanceof Promise) {
//       const currentIndex = Date.now();
//       actualIndex = currentIndex;
//
//       response
//         .catch(e => {
//           if (actualIndex == currentIndex) {
//             throw e;
//           }
//           console.warn(`Not corrected exist from process: `, e);
//         }).then(e => {
//           if (!e) {
//             return;
//           }
//
//           if (actualIndex == currentIndex) {
//             calcRef.value = e;
//           }
//         });
//     }
//     else {
//       calcRef.value = response;
//     }
//
//     return calcRef;
//   };
//
//   return (config.immidiate ?? true) ? calcRef.update() : calcRef;
// };
