/**
 * The current selection of picked items.
 *
 * Framework-agnostic: wrap an instance in Vue's `reactive()` where reactivity
 * is needed. Mutating methods reassign/mutate `items` so a reactive wrapper
 * tracks the changes.
 */
export class Pick {
  /**
   * @param {{ pick: { types?: string[], extensions?: string[], limit?: number } }} config
   */
  constructor(config) {
    this.config = config;
    this.items = [];
    this.candidate = null;
  }

  isAllowed(item) {
    const conf = this.config.pick;
    // NOTE: the legacy code had a precedence bug here
    // (`conf.types.indexOf(item.type)) > -1` bound `> -1` to the whole OR),
    // so the type filter never actually filtered. Fixed to the intended
    // "type allowed AND extension allowed".
    const typeOk = !conf.types || conf.types.length === 0 || conf.types.includes(item.type);
    const extOk = !conf.extensions || conf.extensions.length === 0 || conf.extensions.includes(item.extension);
    return typeOk && extOk;
  }

  contains(item) {
    return this.items.some((i) => i.id === item.id && i.storage === item.storage);
  }

  setCandidate(item) {
    if (item) {
      this.add(item);
    }
    this.candidate = item;
  }

  toggle(item) {
    if (this.contains(item)) {
      this.remove(item);
    } else {
      this.add(item);
    }
  }

  add(item) {
    if (this.contains(item) || !this.isAllowed(item)) {
      return;
    }
    const { candidate } = this;
    if (candidate && item !== candidate && this.contains(candidate)) {
      this.remove(candidate);
    }
    const { limit } = this.config.pick;
    if (limit) {
      while (this.items.length >= limit) {
        this.items.shift();
      }
    }
    this.items.push(item);
  }

  remove(item) {
    this.items = this.items.filter((i) => i.id !== item.id || i.storage !== item.storage);
    if (this.items.length === 0 && this.candidate && item !== this.candidate && this.isAllowed(this.candidate)) {
      this.items.push(this.candidate);
    }
  }

  clear() {
    this.items = [];
    this.candidate = null;
  }

  export() {
    return this.config.pick.limit === 1 ? this.items[0] : this.items.slice(0);
  }
}
