type CSSStyle = Readonly<{
  [Key in keyof CSSStyleDeclaration]?: Key extends
    | 'length'
    | 'parentRule'
    | number
    ? never
    : CSSStyleDeclaration[Key] extends Function
    ? never
    : CSSStyleDeclaration[Key];
}>;

export type Attrs = Record<
  string,
  string | CSSStyle | ((event: Event) => void)
>;

export type Listener<A> = (a: A) => Attrs;

export type Adapter = (e: HTMLElement) => void;

export function setAttrs(
  e: HTMLElement,
  attrs: Attrs,
): Array<[string, (event: Event) => void]> {
  return Object.entries(attrs).flatMap(([name, value]) => {
    if (typeof value === 'string') {
      if (name === 'text') {
        e.innerText = value;
      } else {
        e.setAttribute(name, value);
      }
      return [];
    } else if (typeof value === 'function') {
      e.addEventListener(name, value);
      return [[name, value]];
    } else {
      Object.entries(value as CSSStyle).forEach(([k, v]) => {
        if (v !== undefined) {
          e.style[k as unknown as number] = v;
        }
      });
      return [];
    }
  });
}

export function tag(
  parent: HTMLElement | string,
  attrs: Attrs | Adapter,
  ...children: Array<HTMLElement | string>
): HTMLElement {
  const e =
    typeof parent === 'string' ? document.createElement(parent) : parent;

  typeof attrs === 'function' ? attrs(e) : setAttrs(e, attrs);

  children.forEach(child =>
    e.appendChild(
      typeof child === 'string' ? document.createTextNode(child) : child,
    ),
  );
  return e;
}
