// types.d.ts
declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}
