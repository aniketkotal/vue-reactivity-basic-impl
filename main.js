import { createRef, watch, createReactiveObject, computed } from "./utils.js";

const foo = createRef();
watch(
  foo,
  (value) => {
    console.log(`RefWatch -> Current Value: ${value}`);
  },
  {
    immediate: true,
  },
);
foo.value = "qwer";
foo.value = "zxcv";

const myObj = createReactiveObject({
  va: "bv",
});
watch(myObj, (value) => {
  console.log(`ReactiveObjWatch -> Current Value: ${JSON.stringify(value)}`);
});
myObj.va = "new value";

const x = createRef(5);
const y = createRef(10);
const sum = computed(() => x.value + y.value);
watch(sum, (newValue) => {
  console.log(`Sum changed to: ${newValue}`);
});
x.value = 7;
y.value = 15;
y.value = 2;
