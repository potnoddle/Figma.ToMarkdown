Figma to Markdown Exporter Plugin
=================================

A Figma plugin designed to help designers and developers extract structured content from Figma documents and export it into multiple Markdown files, preserving hierarchy and key information. This is particularly useful for generating documentation, content for static site generators, or as a preliminary step for AI-driven acceptance criteria generation.

✨ Features
----------

-   **Hierarchical Export:** Converts Figma pages, frames, groups, and text layers into a structured Markdown format.

-   **Text Content Extraction:** Extracts and formats text from text layers.

-   **Basic Node Recognition:** Identifies and notes the presence of components, instances, and basic shapes.

-   **Image Export:** Exports images (PNGs) found within nodes (e.g., as fills) and links them correctly in the Markdown.

-   **Multi-file Output & Packaging:** Generates a separate Markdown file for each top-level page and packages all Markdown files along with their associated images into a single downloadable ZIP archive.

-   **User-Friendly UI:** A simple interface to initiate the export process.

-   **Developer Tooling:** Includes TypeScript, ESLint, and Prettier for a robust development experience.

🚀 How to Install
-----------------

This plugin is currently intended for local development and testing.

1.  **Download the Figma Desktop App:** Plugin development requires the Figma desktop application.

2.  **Clone or Download this Repository:** Get the project files onto your local machine.

    ```
    git clone https://github.com/your-username/figma-to-markdown-exporter.git
    cd figma-to-markdown-exporter

    ```

    (Replace `your-username` with your actual GitHub username if you host it there, or just download the ZIP and extract it.)

3.  **Install Dependencies:**

    ```
    npm install

    ```

4.  **Open Figma Desktop App:**

5.  **Create a New Plugin:**

    -   In Figma, go to `Plugins` > `Development` > `New Plugin...`

    -   Choose the `Default (with UI)` template.

    -   Give your plugin a name (e.g., "Figma to Markdown Exporter").

    -   Save the plugin files to a location on your computer.

6.  **Replace Generated Files:** Copy the `manifest.json`, the compiled `code.js` (after running `npm run build`), and `ui.html` from this repository into the folder Figma created for your new plugin, overwriting the existing template files.

7.  **Run the Plugin:**

    -   In Figma, go to `Plugins` > `Development` > `Open Plugin` > `[Your Plugin Name]`.

💡 How to Use
-------------

1.  **Open a Figma File:** Open the Figma document you wish to export.

2.  **Run the Plugin:**

    -   Right-click anywhere on the canvas, then navigate to `Plugins` > `[Your Plugin Name]`.

    -   Alternatively, go to the Figma menu (top-left) > `Plugins` > `Development` > `[Your Plugin Name]`.

3.  **Click "Export All to Markdown":** A simple plugin UI will appear. Click the button to start the export process.

4.  **Download ZIP File:** Once the export is complete, a download link will appear in the plugin UI. Click it to download a `.zip` file containing all your Markdown files and an `images` folder with the exported assets.

🛠️ Development
---------------

### Project Structure

-   `manifest.json`: Plugin metadata and entry points.

-   `code.ts`: The core plugin logic written in TypeScript, interacting with the Figma API. This is compiled to `code.js`.

-   `ui.html`: The HTML structure for the plugin's user interface.

-   `ui.js`: (Optional, but recommended) JavaScript for UI interactions.

-   `ui.css`: (Optional, but recommended) CSS for styling the UI.

### Building and Running

-   **`npm install`**: Installs necessary Node.js packages (e.g., `jszip` for creating ZIP archives).

-   **`npm run build`**: Compiles TypeScript to JavaScript (if using `code.ts`).

-   **`npm run watch`**: Watches for changes in your TypeScript files and recompiles automatically.

### Debugging

-   **Figma Console:** `console.log()` statements in `code.ts` will appear in Figma's developer console (accessible via `Plugins` > `Development` > `Open Console`).

-   **Browser DevTools:** The plugin's UI (`ui.html`) runs in an iframe. You can inspect and debug it using your browser's developer tools (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows) after opening the plugin.

🔮 Future Enhancements
----------------------

-   **Selective Export:** Allow users to select specific pages or frames for export.

-   **Configurable Output:** Add options for Markdown formatting (e.g., different heading levels for frames vs. groups).

-   **LLM Integration (Advanced):**

    -   Integrate with an external Large Language Model (LLM) API (e.g., Gemini API, OpenAI API) to analyze the extracted text and generate acceptance criteria, user stories, or other documentation.

    -   This would involve sending extracted text to the LLM and then incorporating the LLM's response into the Markdown output.

    -   **Security Note:** Handling API keys for LLMs securely would be paramount, potentially requiring a small backend service.

-   **Table and List Recognition:** More sophisticated parsing to detect and format tables and lists from Figma layouts.

-   **Component Property Export:** Extract and document component properties.

-   **Version Control Integration:** Directly push generated Markdown to a Git repository.

💻 Technologies Used
--------------------

-   **Figma Plugin API**

-   **TypeScript** (for plugin logic)

-   **JavaScript** (for UI logic)

-   **HTML & CSS**

-   **Node.js** (for local development and `npm`)

-   **JSZip** (for creating ZIP archives for download)
-   **ESLint, Prettier, TypeScript** (for development workflow)

📄 License
----------

This project is open-source and available under the [MIT License](https://gemini.google.com/app/LICENSE "null").