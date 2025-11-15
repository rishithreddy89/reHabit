// Minimal shim for `class-variance-authority` (exports `cva`)
export function cva(base = '', _options = {}) {
  // returns a function that merges class strings and allows a `className` prop
  return (props = {}) => {
    const cls = [];
    if (typeof base === 'string' && base) cls.push(base);
    if (props.className) cls.push(props.className);
    // if props.variant or other props provide classes, user code may supply them inline
    return cls.filter(Boolean).join(' ');
  };
}

export default cva;
