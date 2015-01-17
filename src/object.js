import Emitter from "./emitter";

var objectId = 0;

class RynoObject {
  static prop(name, opts = {}) {
    var descriptor = Object.assign({
      get: null,
      set: null,
      readonly: false,
      default: undefined
    }, opts);

    if (!this.prototype.hasOwnProperty('__props__')) {
      this.prototype.__props__ = Object.create(this.prototype.__props__ || null);
    }

    this.prototype.__props__[name] = descriptor;

    Object.defineProperty(this.prototype, name, {
      get: function() { return this.getProp(name); },
      set: descriptor.readonly ? undefined : function(value) { this.setProp(name, value); },
      configurable: false,
      enumerable: true
    });

    return this;
  }

  // Public: Returns a number that can be used to uniquely identify the receiver object.
  get objectId() { return this.__objectId__ = this.__objectId__ || ++objectId; }

  getProp(name) {
    var descriptor = this.__props__ && this.__props__[name], key = `__${name}`, value;

    if (!descriptor) {
      throw new Error(`Ryno.Object#getProp: unknown prop name \`${name}\``);
    }

    value = descriptor.get ? descriptor.get.call(this) : this[key];
    value = (value === undefined) ? descriptor.default : value;

    return value;
  }

  setProp(name, value) {
    var descriptor = this.__props__ && this.__props__[name],
        key        = `__${name}`,
        old        = this.getProp(name);

    if (!descriptor) {
      throw new Error(`Ryno.Object#setProp: unknown prop name \`${name}\``);
    }

    if (descriptor.readonly) {
      throw new TypeError(`Ryno.Object#setProp: cannot set readonly property \`${name}\` of ${this}`);
    }

    if (descriptor.set) { descriptor.set.call(this, value); }
    else { this[key] = value; }

    this.emit(`change:${name}`, {object: this, old});
  }
}

Object.assign(RynoObject.prototype, Emitter);

export default RynoObject;
