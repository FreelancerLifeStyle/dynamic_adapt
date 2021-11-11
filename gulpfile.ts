import { fontsStl } from "com";

const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCss = require("gulp-clean-css");
const del = require("del");
const fileInclude = require("gulp-file-include");
const fonter = require("gulp-fonter-unx");
const fs = require("fs");
const groupMedia = require("gulp-group-css-media-queries");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const rename = require("gulp-rename");
const scss = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const buffer = require("vinyl-buffer");
const svgSprite = require("gulp-svg-sprite");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const uglify = require("gulp-uglify-es").default;
const webp = require("gulp-webp");
const webpHtml = require("gulp-webp-html");
const webpcss = require("gulp-webpcss");
const browserify = require("browserify");
const sourceify = require("sourceify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const {dest, src, series, parallel, watch, task} = require("gulp");

const projectFolder = require("path").basename(__dirname);
const srcFolder = "src";

const path = {
    build: {
        html: `${projectFolder}/`,
        css: `${projectFolder}/css/`,
        js: `${projectFolder}/js/`,
        img: `${projectFolder}/img/`,
        svg: `${projectFolder}/svg/`,
        fonts: `${projectFolder}/fonts/`,
    },
    src: {
        html: [`${srcFolder}/**/*.html`, `!${srcFolder}/**/_*.html`],
        scss: `${srcFolder}/scss/style.scss`,
        ts: `${srcFolder}/ts/**/*.ts`,
        js: `${projectFolder}/js/**/*.js`,
        map: `${projectFolder}/js/**/*.map`,
        img: `${srcFolder}/img/**/*.{jpg,png,svg,gif,ico,web}`,
        svg: `${srcFolder}/img/**/*.svg`,
        fonts: `${srcFolder}/fonts/*.ttf`,
        fontsOtf: `${srcFolder}/fonts/*.otf`,
    },
    watch: {
        html: `${srcFolder}/**/*.html`,
        scss: `${srcFolder}/scss/style.scss`,
        ts: `${srcFolder}/ts/**/*.ts`,
        img: `${srcFolder}/img/**/*.{jpg,png,svg,gif,ico,web}`,
    },
    clean: `./${projectFolder}/`
};

const browserSync = () => {
    browsersync.init({
        server: {
            baseDir: `./${projectFolder}/`,
            // httpModule: "http2",
            // https: true
        },
        port: 4000,
        notify: false
    });
};

const html = () =>
    src(path.src.html)
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());

const images = () =>
    src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin(
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: false},
                        {cleanupIDs: false}
                    ]
                })
            ]
        ))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());

const clean = () => del(path.clean);

const css = () =>
    src(`${srcFolder}/scss/style.scss`)
        .pipe(scss({outputStyle: "expanded"}).on("error", scss.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 version"],
            cascade: true
        }))
        .pipe(webpcss())
        .pipe(groupMedia())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write())
        .pipe(dest(path.build.css))
        .pipe(cleanCss({level: 2}))
        .pipe(rename({suffix: ".min"}))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());

const fonts = () => {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream());

    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream());
};


task("svgSprite", () => src([`${path.src.svg}`])
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: `./svg/icons.svg`,
                example: true
            }
        }
    }))
    .pipe(dest(path.build.img)));

task("otf2ttf", () => src([`${srcFolder}/fonts/**/*.otf`])
    .pipe(fonter({
        formats: ["ttf"]
    }))
    .pipe(dest(`${srcFolder}/fonts/`)));

const bundleTs = () => {
    const f =
        browserify({
            basedir: ".",
            debug: true,
            transform: [sourceify],
            entries: ["src/ts/dynamicAdapt.ts"],
            cache: {},
            packageCache: {}
        })
            .plugin(tsify)
            .bundle();

    f.pipe(source("bundle.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(path.build.js));

    return f.pipe(source("bundle.min.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
};

const watchFiles = () => {
    watch([path.watch.html], html);
    watch([path.watch.scss], css);
    watch([path.watch.ts], bundleTs);
    watch([path.watch.img], images);
};

const fontsStyle = (done: () => void) => {
    fontsStl(srcFolder, path, fs);
    done();
};

const build = series(clean, images, css, html, bundleTs, fonts, fontsStyle);
const buildTs = series(clean, bundleTs);
const watchServ = parallel(series(build, browserSync), watchFiles);

exports.clean = clean;
exports.build = build;
exports.buildTs = buildTs;
exports.default = watchServ;
