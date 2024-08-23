import { createRef, watch, createReactiveObject } from "./utils.js";

const foo = createRef();

watch(
  foo,
  (value) => {
    console.log(`From watcher! Current Value: ${value}`);
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
  console.log(`From computed watcher! Current Value: ${JSON.stringify(value)}`);
});

myObj.va = "new value";
