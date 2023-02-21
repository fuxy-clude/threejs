// 防抖
const debounce = function (fn, wait) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    setTimeout(() => {
      fn.apply(this, arguments);
    }, wait)
  }
}
// 节流
const throttle = (fn, wait) => {
  let time = 0;
  return function () {
    let currentTime = new Date().getTime();
    let arg = arguments;
    if (currentTime - time > wait) {
      fn.apply(this, arg);
      time = currentTime;
    }
  }
}
// promise
const StatusEnum = {
  Pending: 0,
  Success: 1,
  Fail: 2
}
class MyPromise {
  status = statusEnum.Pending;
  constructor(callback) {
    this.result = undefined;
    this.errorInfo = undefined;


    const resolve = value => {
      if (this.status === StatusEnum.Pending) {
        this.status = StatusEnum.Success;
        this.result = value;
      }
    }

    const reject = errorInfo => {
      if (this.status === StatusEnum.Pending) {
        this.status = StatusEnum.Fail;
        this.errorInfo = errorInfo;
      }
    }

    try {
      callback(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onResolve, onReject) {
    setTimeout(() => {
      if (this.status === StatusEnum.Success) {
        onResolve(this.result);
      } else if (this.status === StatusEnum.Fail) {
        onReject(this.errorInfo)
      }
    })
  }
}
// 柯里化


Function.prototype.myApply = function(current = {}, args) {
  console.log('args', args)
  if (typeof this !== 'function') {
    throw new TypeError('Type Error');
  }
  const fn = Symbol('fn');
  current[fn] = this;

  const res = current[fn]([...args]);
  console.log('res',res)
  delete current[fn];
  return res;
}

let fn = (value) => {
  console.log(this.a + value);
}
const obj = {
  a: 233
}
console.log(fn.myApply(undefined, [1]))