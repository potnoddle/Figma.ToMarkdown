// This file runs in the Figma plugin sandbox
// Ensure your build process defines __html__ (e.g., from a ui.html file).
// Ensure @figma/plugin-typings are installed and configured in tsconfig.json.

console.log('[code.ts] Plugin code starting.');
console.log(`[code.ts] typeof __html__: ${typeof __html__}`);
if (typeof __html__ === 'string') {
  console.log(`[code.ts] __html__ (first 100 chars): ${__html__.substring(0, 100)}`);
} else {
  console.log('[code.ts] __html__ is NOT a string or is undefined.');
}

figma.showUI(__html__, { width: 300, height: 200, title: 'Export to Markdown' });

// Define an interface for plugin messages for better type safety
interface PluginMessage {
  type: string;
  [key: string]: any; // Allows for additional properties on messages
}

console.log('[code.ts] Logging figma.ui object state just before onmessage check:');
console.log('[code.ts] typeof figma.ui:', typeof figma.ui);
if (typeof figma.ui === 'object' && figma.ui !== null) {
  console.log('[code.ts] typeof figma.ui.onmessage:', typeof figma.ui.onmessage);
}

// Assign the message handler directly.
// figma.ui is expected to be an object with an onmessage property after figma.showUI.
figma.ui.onmessage = async (msg: PluginMessage, props: OnMessageProperties) => {
  // props argument is now included, even if not immediately used.

  if (msg.type === 'export-markdown') {
    // Notify UI that processing has started
    figma.ui.postMessage({ type: 'processing-start' });
    const markdownFiles: { [filename: string]: string } = {};
    const imageAssets: { [filename: string]: Uint8Array } = {}; // To store { 'images/filename.png': Uint8Array }
    // Helper function for recursive traversal
    async function traverseNode(
      node: SceneNode,
      indentLevel: number,
      currentMarkdownForPage: string[], // Array for the current page's markdown
      pageNameForAssets: string // Name of the current page for asset naming
    ) {
      const indent = '  '.repeat(indentLevel); // For visual hierarchy in Markdown output
      const nodeNameSafe = node.name.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'UnnamedNode';
      let hasExportedImageFill = false;

      // Attempt to export image fills for relevant node types
      if (
        (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON' ||
         node.type === 'STAR' || node.type === 'VECTOR' || node.type === 'FRAME' ||
         node.type === 'COMPONENT' || node.type === 'INSTANCE') &&
        'fills' in node && Array.isArray(node.fills)
      ) {
        for (const paint of node.fills) {
          if (paint.type === 'IMAGE' && paint.visible !== false) {
            try {
              const imageBytes = await node.exportAsync({ format: 'PNG' });
              const imageFileName = `images/${pageNameForAssets}_${nodeNameSafe}_${node.id}.png`;
              imageAssets[imageFileName] = imageBytes;
              // Correct Markdown image link: !Alt Text
              currentMarkdownForPage.push(`${indent}!${node.name || node.type}\n\n`);
              hasExportedImageFill = true;
              break; // Export only the first visible image fill for this node
            } catch (e) {
              console.error(`Error exporting image fill for node ${node.name}:`, e);
              currentMarkdownForPage.push(`${indent}- Error exporting image for \`${node.name}\`.\n`);
            }
          }
        }
      }

      switch (node.type) {
        // PAGE nodes are handled by the main loop, this function processes their children.

        case 'FRAME':
        case 'COMPONENT':
        case 'COMPONENT_SET':
          currentMarkdownForPage.push(`${indent}## ${node.name}\n\n`);
          // Image fill (if any) is already handled above and linked.
          if ('description' in node && node.description) {
            currentMarkdownForPage.push(`${indent}**Description:** ${node.description}\n\n`);
          }
          if ('children' in node) {
            for (const child of node.children) {
              await traverseNode(child, indentLevel + 1, currentMarkdownForPage, pageNameForAssets);
            }
          }
          break;

        case 'GROUP':
          currentMarkdownForPage.push(`${indent}### ${node.name}\n\n`);
          if ('children' in node) {
            for (const child of node.children) {
              await traverseNode(child, indentLevel + 1, currentMarkdownForPage, pageNameForAssets);
            }
          }
          break;

        case 'TEXT':
          const textNode = node as TextNode;
          const textContent = textNode.characters.trim();
          if (textContent) {
            // Basic heuristic for headings (can be improved)
            // You might need to check font size, weight, or specific naming conventions
            if (textNode.fontSize && typeof textNode.fontSize === 'number' && textNode.fontSize > 24) {
              currentMarkdownForPage.push(`${indent}#### ${textContent}\n\n`);
            } else {
              currentMarkdownForPage.push(`${indent}${textContent}\n\n`);
            }
          }
          break;

        case 'INSTANCE': // Component instance
          const instanceNode = node as InstanceNode;
          const masterName = instanceNode.mainComponent ? instanceNode.mainComponent.name : 'Unknown Master';
          // Image fill for the instance itself (if any) handled above. Still list it as an instance.
          currentMarkdownForPage.push(`${indent}- **Instance:** \`${instanceNode.name}\` (from Master: \`${masterName}\`)\n`);
          if ('children' in node && node.children.length > 0) { // Traverse overridden children / slots
            for (const child of node.children) {
                await traverseNode(child, indentLevel + 1, currentMarkdownForPage, pageNameForAssets);
            }
          }
          break;

        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'VECTOR':
        case 'POLYGON':
        case 'STAR':
          if (!hasExportedImageFill) { // Only add this if no image fill was exported for this node
            currentMarkdownForPage.push(`${indent}- [${node.type.toLowerCase()}] \`${node.name}\`\n`);
          }
          // For VECTOR nodes that might be groups of other vectors (e.g., after boolean operations)
          // If a VECTOR node has children, it's acting as a ParentNode.
          // Use a more specific type assertion to avoid DOM ParentNode conflicts.
          if (node.type === 'VECTOR' && 'children' in node && (node as SceneNode & { children: ReadonlyArray<SceneNode> }).children.length > 0) {
             for (const child of (node as SceneNode & { children: ReadonlyArray<SceneNode> }).children) {
                await traverseNode(child as SceneNode, indentLevel + 1, currentMarkdownForPage, pageNameForAssets);
            }
          }
          break;

        // Add more cases for other node types as needed
        default:
          // You can log unhandled types for debugging
          console.log(`Unhandled node type: ${node.type} - Name: "${node.name}" - ID: ${node.id}`);
          break;
      }
    }

    // Start traversal from each top-level page
    for (const page of figma.root.children) {
      if (page.type === 'PAGE') {
        const pageName = page.name.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'Untitled_Page';
        const markdownForThisPage: string[] = []; // Fresh array for each page's content

        // Notify UI about the current page being processed
        figma.ui.postMessage({ type: 'processing-page', pageName: page.name });

        markdownForThisPage.push(`# ${page.name}\n\n`); // Page title

        if ('children' in page) {
          for (const child of page.children) {
            // Start indentLevel at 1 for direct children of the page
            await traverseNode(child, 1, markdownForThisPage, pageName);
          }
        }
        markdownFiles[`${pageName}.md`] = markdownForThisPage.join('');
      }
    }
    // Send the collected markdown content back to the UI
    figma.ui.postMessage({ type: 'export-complete', files: markdownFiles, images: imageAssets });
  }
};