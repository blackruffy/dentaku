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

export function setAttrs(e: HTMLElement, attrs: Attrs): void {
  Object.entries(attrs).forEach(([name, value]) =>
    typeof value === 'string'
      ? name === 'text'
        ? (e.innerText = value)
        : e.setAttribute(name, value)
      : typeof value === 'function'
      ? e.addEventListener(name, value)
      : Object.entries(value as CSSStyle).forEach(([k, v]) => {
          if (v !== undefined) {
            e.style[k as unknown as number] = v;
          }
        }),
  );
}

export function tag(
  parent: HTMLElement | string,
  attrs: Attrs | Adapter,
  ...children: Array<HTMLElement | string>
): HTMLElement {
  const e =
    typeof parent === 'string' ? document.createElement(parent) : parent;

  e.style;
  typeof attrs === 'function' ? attrs(e) : setAttrs(e, attrs);

  children.forEach(child =>
    e.appendChild(
      typeof child === 'string' ? document.createTextNode(child) : child,
    ),
  );
  return e;
}
