class Session {
  constructor(name) {
    this.name = name;
  }

  setAttribute(key, value) {
    this[key] = value;
  }

  getAttribute(key) {
    return this[key];
  }

  static createSessionId() {
    return (new Date().getTime() + Math.random()).toString().replace('.', '');
  }
}

module.exports = Session;
