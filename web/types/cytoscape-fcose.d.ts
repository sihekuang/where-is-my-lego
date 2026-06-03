// cytoscape-fcose ships no TypeScript types; it registers as a Cytoscape extension.
declare module "cytoscape-fcose" {
  const ext: cytoscape.Ext;
  export default ext;
}
