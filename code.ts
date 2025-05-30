// This file runs in the Figma plugin sandbox
// Ensure your build process defines __html__ (e.g., from a ui.html file).
// Ensure @figma/plugin-typings are installed and configured in tsconfig.json.
figma.showUI(__html__, { width: 300, height: 200, title: 'Export to Markdown' });

// Define an interface for plugin messages for better type safety
interface PluginMessage {
  type: string;
  [key: string]: any; // Allows for additional properties on messages
}

// Listen for messages from the UI
figma.ui.onMessage(async (msg: PluginMessage) => {
  if (msg.type === 'export-markdown') {
    const markdownContent: { [filename: string]: string } = {};

    // Helper function for recursive traversal
    async function traverseNode(node: SceneNode | PageNode, indentLevel: number = 0, currentMarkdown: string[] = []) {
      const indent = '  '.repeat(indentLevel); // For visual hierarchy in Markdown output

      switch (node.type) {
        case 'PAGE':
          // Start a new Markdown file for each page
          const pageName = node.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled_Page';
          currentMarkdown.push(`# ${node.name}\n\n`);
          // Recursively traverse children of the page
          if ('children' in node) {
            for (const child of node.children) {
              await traverseNode(child, indentLevel + 1, currentMarkdown);
            }
          }
          markdownContent[`${pageName}.md`] = currentMarkdown.join('');
          currentMarkdown = []; // Reset for the next page
          break;

        case 'FRAME':
        case 'COMPONENT':
        case 'COMPONENT_SET':
          currentMarkdown.push(`${indent}## ${node.name}\n\n`);
          // Add component documentation if available
          if ('description' in node && node.description) {
            currentMarkdown.push(`${indent}**Description:** ${node.description}\n\n`);
          }
          if ('children' in node) {
            for (const child of node.children) {
              await traverseNode(child, indentLevel + 2, currentMarkdown); // Deeper indent for frame content
            }
          }
          break;

        case 'GROUP':
          currentMarkdown.push(`${indent}### ${node.name}\n\n`);
          if ('children' in node) {
            for (const child of node.children) {
              await traverseNode(child, indentLevel + 3, currentMarkdown);
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
              currentMarkdown.push(`${indent}#### ${textContent}\n\n`);
            } else {
              currentMarkdown.push(`${indent}${textContent}\n\n`);
            }
          }
          break;

        case 'INSTANCE': // Component instance
          const instanceNode = node as InstanceNode;
          const masterName = instanceNode.mainComponent ? instanceNode.mainComponent.name : 'Unknown Master';
          currentMarkdown.push(`${indent}- **Instance:** \`${instanceNode.name}\` (from Master: \`${masterName}\`)\n`);
          break;

        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'VECTOR':
          // You might just note the presence of shapes
          currentMarkdown.push(`${indent}- [${node.type.toLowerCase()}] \`${node.name}\`\n`);
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
      await traverseNode(page);
    }

    // Send the collected markdown content back to the UI
    figma.ui.postMessage({ type: 'export-complete', files: markdownContent });
  }
});