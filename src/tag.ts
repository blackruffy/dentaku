export function tag(
  parent: HTMLElement | string,
  attrs: Record<string, string>,
  ...children: Array<HTMLElement | string>
): HTMLElement {
  const e =
    typeof parent === 'string' ? document.createElement(parent) : parent;
  Object.entries(attrs).forEach(([name, value]) => e.setAttribute(name, value));
  children.forEach(child =>
    e.appendChild(
      typeof child === 'string' ? document.createTextNode(child) : child,
    ),
  );
  return e;
}
