// Minimal shim for `tailwind-merge` (exports `twMerge`)
export function twMerge(...args) {
  // flatten and join class names — no real merge logic
  return args.flat(Infinity).filter(Boolean).join(' ');
}

export default twMerge;
