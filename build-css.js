const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const rename = require("postcss-rename");

function findProjectRoot(dir) {
    let currentDir = dir;
    let lastFound = null;
    
    try {
        while (currentDir !== path.parse(currentDir).root) {
            if (fs.existsSync(path.join(currentDir, "package.json"))) {
                lastFound = currentDir;
            }
            currentDir = path.dirname(currentDir);
        }
    } catch (err) {
        console.error("Permission error while searching for project root:", err);
    }
    
    return lastFound || dir; // If no package.json is found, return the original directory
}

const projectRoot = findProjectRoot(__dirname);

const inputFontPath = path.resolve(projectRoot, "node_modules/glyphicons-only-bootstrap/fonts/glyphicons-halflings-regular.woff");
const outputFontPath = path.resolve(__dirname, "build/fonts/glyphicons-halflings-regular.woff");

const inputCSSPath = path.resolve(projectRoot, "node_modules/glyphicons-only-bootstrap/css/bootstrap.css");
const outputCSSPath = path.resolve(__dirname, "build/css/bootstrap.css");

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputCSSPath), { recursive: true });
fs.mkdirSync(path.dirname(outputFontPath), { recursive: true });

// Copy font file
fs.copyFile(inputFontPath, outputFontPath, (err) => {
    if (err) {
        console.error("Error copying font file:", err);
        return;
    }
    console.log("Font file copied successfully to:", outputFontPath);
});

// Process CSS file
fs.readFile(inputCSSPath, "utf8", (err, css) => {
    if (err) {
        console.error("Error reading CSS file:", err);
        return;
    }

    console.log("Processing CSS...");

    postcss([
        rename({
            strategy: (className) => {
                if (className.startsWith("glyphicon-")) {
                    return className.replace("glyphicon-", "icon-");
                }
                if (className === "glyphicon") {
                    return className.replace("glyphicon", "icon");
                }
                return className;
            },
            by: "whole"
        })
    ])
    .process(css, { from: inputCSSPath, to: outputCSSPath })
    .then(result => {
        fs.writeFile(outputCSSPath, result.css, (err) => {
            if (err) {
                console.error("Error writing modified CSS file:", err);
                return;
            }
            console.log("Build complete! Modified CSS saved to:", outputCSSPath);
        });
    })
    .catch(err => console.error("PostCSS processing error:", err));
});
