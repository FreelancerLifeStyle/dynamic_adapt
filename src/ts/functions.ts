import ErrnoException = NodeJS.ErrnoException;

export function fontsStl(source_folder: string, path: any, fs: any) {

    const fileName = `${source_folder}/scss/fonts.scss`;

    return fs.writeFile(fileName, "@mixin font($font_name, $file_name, $weight, $style) {\n" +
        "    @font-face {\n" +
        "        font-family: $font_name;\n" +
        "        font-display: swap;\n" +
        "        src: url(\"../fonts/#{$file_name}.woff\") format(\"woff\"), url(\"../fonts/#{$file_name}.woff2\") format(\"woff2\");\n" +
        "        font-weight: #{$weight};\n" +
        "        font-style: #{$style};\n" +
        "    }\n" +
        "}\n\n", () => {
        fs.readdir(path.build.fonts, function(err: ErrnoException | null, items?: string[]) {
            Array.from(new Set(items?.map((item) => item.split(".")[0]))).forEach(filename => {

                const makeFontName = (filename: string): string => filename.replace("italic", "").replace("Italic", "").replace("regular", "").replace("Regular", "").replace("Bold", "").replace("bold", "");

                if (filename.toLowerCase().indexOf("bold") !== -1) {
                    if (filename.toLowerCase().indexOf("italic") !== -1) {
                        fs.appendFile(fileName, '@include font("' + makeFontName(filename) + '", "' + filename + '", "700", "italic");\n', () => {});
                    } else {
                        fs.appendFile(fileName, '@include font("' +  makeFontName(filename) + '", "' + filename + '", "700", "normal");\n', () => {});
                    }
                } else if (filename.toLowerCase().indexOf("regular") !== -1) {
                    if (filename.toLowerCase().indexOf("italic") !== -1) {
                        fs.appendFile(fileName, '@include font("' +  makeFontName(filename) + '", "' + filename + '", "400", "italic");\n', () => {});
                    } else {
                        fs.appendFile(fileName, '@include font("' +  makeFontName(filename) + '", "' + filename + '", "400", "normal");\n', () => {});
                    }
                }
            });
        });
    });
}

// function testWebP(callback: (support: boolean) => void) {
//
//     const webP = new Image();
//     webP.onload = webP.onerror = function() {
//         callback(webP.height == 2);
//     };
//     webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
// }
//
// testWebP(function(support: boolean) {
//
//     if (support === true) {
//         document.querySelector("body")?.classList.add("webp");
//     } else {
//         document.querySelector("body")?.classList.add("no-webp");
//     }
// });
