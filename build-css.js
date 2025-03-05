const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const rename = require("postcss-rename");

const inputCSSPath = path.resolve(__dirname, "node_modules/glyphicons-only-bootstrap/css/bootstrap.css");
const outputCSSPath = path.resolve(__dirname, "build/bootstrap.css");

fs.mkdirSync(path.dirname(outputCSSPath), { recursive: true });

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
