type CSSStyle = Readonly<{
  [Key in keyof CSSStyleDeclaration]?: Key extends
    | 'length'
    | 'parentRule'
    | number
    | 'getPropertyPriority'
    | 'getPropertyValue'
    | 'item'
    | 'removeProperty'
    | 'setProperty'
    ? never
    : CSSStyleDeclaration[Key];
}>;

type EventListener = (event: Event) => void;

export type Attrs = Record<string, string | CSSStyle | EventListener>;

export type Listener<A> = (a: A) => Attrs;

export class Tag {
  private parent: Element | string;
  private attrs: Attrs;
  private children: Array<Tag>;
  private eventListeners: Array<[string, EventListener]>;
  private target: Element | null;

  constructor(parent: Element | string, attrs: Attrs, ...children: Array<Tag>) {
    this.parent = parent;
    this.attrs = attrs;
    this.children = children;
    this.eventListeners = Object.entries(this.attrs).filter(
      ([_, v]) => typeof v === 'function',
    ) as Array<[string, EventListener]>;
    this.target = null;
  }

  getParent() {
    return this.parent;
  }

  getAttrs() {
    return this.attrs;
  }

  getChildren() {
    return this.children;
  }

  removeEventListeners() {
    this.eventListeners.forEach(([n, f]) =>
      this.getTarget().removeEventListener(n, f),
    );
  }

  getTarget(): Element {
    if (this.target === null) {
      this.target = this.toHTMLElement();
    }
    return this.target;
  }

  update(tag: Tag): void {
    traverse(this, tag, (x, y) => {
      x.removeEventListeners();
      x.eventListeners = y.eventListeners;
      setAttrs(x.getTarget(), y.getAttrs());
    });
  }

  private toHTMLElement(): Element {
    const e =
      typeof this.parent === 'string'
        ? document.createElement(this.parent)
        : this.parent;

    setAttrs(e, this.attrs);

    this.children.forEach(child =>
      e.appendChild(
        typeof child === 'string'
          ? document.createTextNode(child)
          : child.getTarget(),
      ),
    );
    return e;
  }
}

function traverse(a: Tag, b: Tag, f: (x: Tag, y: Tag) => void) {
  f(a, b);
  const ac = a.getChildren();
  const bc = b.getChildren();
  for (let i = 0; i < ac.length; i++) {
    traverse(ac[i], bc[i], f);
  }
}

export function setAttrs(e: Element, attrs: Attrs): void {
  Object.entries(attrs).forEach(([name, value]) => {
    if (typeof value === 'string') {
      if (name === 'text') {
        (e as HTMLElement).innerText = value;
      } else {
        e.setAttribute(name, value);
      }
    } else if (typeof value === 'function') {
      e.addEventListener(name, value);
    } else {
      Object.entries(value).forEach(([k, v]) => {
        if (v !== undefined)
          (e as HTMLElement).style[k as unknown as number] = v;
      });
    }
  });
}

export function tag(
  parent: Element | string,
  attrs: Attrs,
  ...children: Array<Tag>
): Tag {
  return new Tag(parent, attrs, ...children);
}
