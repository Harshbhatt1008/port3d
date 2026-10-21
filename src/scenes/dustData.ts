/** Shared deterministic destinations make the loader residue and latent field join. */
export function dustPosition(index: number): [number, number, number] {
  function hash(n: number) {
    let x = Math.imul(n ^ 0x484226, 1597334677);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  const gaussian = (n: number) =>
    Math.sqrt(-2 * Math.log(Math.max(0.0001, hash(n)))) *
    Math.cos(hash(n + 1) * Math.PI * 2);
  const cluster = index % 3;
  return [
    (cluster - 1) * 15 + gaussian(index * 7 + 1) * 7,
    gaussian(index * 7 + 3) * 9 + (cluster === 1 ? 5 : -3),
    -20 - hash(index * 7 + 5) * 190,
  ];
}
