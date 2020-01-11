const svgToMiniDataURI = require('mini-svg-data-uri');
const SVGO = require('svgo');

let svgo;

// eslint-disable-next-line no-unused-vars
exports.onPreBootstrap = (_, pluginOptions) => {
  svgo = new SVGO({
    multipass: true,
    floatPrecision: 2,
    plugins: [
      { removeDoctype: true },
      { removeXMLProcInst: true },
      { removeComments: true },
      { removeMetadata: true },
      { removeXMLNS: false },
      { removeEditorsNSData: true },
      { cleanupAttrs: true },
      { inlineStyles: true },
      { minifyStyles: true },
      { convertStyleToAttrs: true },
      { cleanupIDs: true },
      { prefixIds: true },
      { removeRasterImages: true },
      { removeUselessDefs: true },
      { cleanupNumericValues: true },
      { cleanupListOfValues: true },
      { convertColors: true },
      { removeUnknownsAndDefaults: true },
      { removeNonInheritableGroupAttrs: true },
      { removeUselessStrokeAndFill: true },
      { removeViewBox: false },
      { cleanupEnableBackground: true },
      { removeHiddenElems: true },
      { removeEmptyText: true },
      { convertShapeToPath: true },
      { moveElemsAttrsToGroup: true },
      { moveGroupAttrsToElems: true },
      { collapseGroups: true },
      { convertPathData: true },
      { convertTransform: true },
      { removeEmptyAttrs: true },
      { removeEmptyContainers: true },
      { mergePaths: true },
      { removeUnusedNS: true },
      { sortAttrs: true },
      { removeTitle: true },
      { removeDesc: true },
      { removeDimensions: true },
      { removeAttrs: false },
      { removeAttributesBySelector: false },
      { removeElementsByAttr: false },
      { addClassesToSVGElement: false },
      { removeStyleElement: false },
      { removeScriptElement: false },
      { addAttributesToSVGElement: false },
      { removeOffCanvasPaths: true },
      { reusePaths: false }
    ]
  });
}

const parseSvg = async svg => {
  // Optimize
  if (svg.indexOf('base64') !== -1) {
    console.log(
      'SVG contains pixel data. Pixel data was removed to avoid file size bloat.'
    );
  }
  const { data: content } = await svgo.optimize(svg);

  // Create mini data URI
  const dataURI = svgToMiniDataURI(content);

  return {
    content,
    originalContent: svg,
    parsed: 'inlineSVG',
    dataURI
  };
};

async function onCreateNode(
  {
    node,
    actions: { createNode, createParentChildLink },
    loadNodeContent,
    createNodeId,
    createContentDigest
  },
  // eslint-disable-next-line no-unused-vars
  pluginOptions
) {
  function transformObject(obj, id, type) {
    const svgNode = {
      ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type
      }
    };
    createNode(svgNode);
    createParentChildLink({ parent: node, child: svgNode });
  }

  // We only care about JSON content.
  if (node.internal.mediaType !== `image/svg+xml`) {
    return;
  }

  const content = await loadNodeContent(node);
  const parsedContent = await parseSvg(content);
  transformObject(
    parsedContent,
    parsedContent.id
      ? String(parsedContent.id)
      : createNodeId(`${node.id} >>> SVG`),
    'SVG'
  );
}

exports.onCreateNode = onCreateNode;
