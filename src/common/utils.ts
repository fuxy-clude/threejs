export class ColorGuiHelp {
  object: any;
  prop: any;
  constructor(object: any, prop: any) {
    this.object = object;
    this.prop = prop;
  }

  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}