const { src, dest, parallel, series, watch } = require('gulp');
const { notify } = require('browser-sync');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');


//Server
function browsersync() {
    browserSync.init({
        server: { baseDir: 'src/'},
        notify: false, //Disable notify in browser
        online: true  //Disable networking
    });
}

//Scripts JS
function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'src/js/main.js'
        
    ]).pipe(concat('main.min.js')).pipe(uglify()).pipe(dest('src/js')).pipe(browserSync.stream());
}

//SASS
function styles() {

    return src(['src/scss/main.scss', 'src/css/normalize.css']) //return src('src/scss/main.scss')
        .pipe(sass()).pipe(concat('main.min.css'))
        .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true}))
        .pipe(cleancss(({level: {1: {specialComments: 0 } }, /*format: 'beautify' */} ))) //beautify can make main.min.css readable
        .pipe(dest('src/css'))
        .pipe(browserSync.stream());

}

//IMAGES
function images() {
    return src('src/assets/**/*')
    .pipe(newer('src/img'))
    .pipe(imagemin())
    .pipe(dest('src/img'));
}

function cleanimg() {
    return del('src/img/**/*', {force:true});
}

//BUILD
function buildcopy() {

    return src(['src/css/**/*.min.css', 'src/js/**/*.min.js', 'src/img/**/*', 'src/index.html'], { base: 'src'}).pipe(dest('dist'));

}
function cleandist() {
    return del('dist/**/*', {force:true});
}

//WatchDog
function startwatch(){
    watch('src/**/*.html').on('change', browserSync.reload);
    watch('src/scss/*.scss', styles);
    watch(['src/**/*.js', '!src/**/*.min.js'], scripts);
    watch('src/assets/**/*', images);
}

exports.browsersync = browsersync; // Export function browsersync in task called browsersync
exports.scripts = scripts;         // Export function scripts in task called scripts  
exports.styles = styles;
exports.images = images;
exports.del = cleanimg;
exports.build = series(cleandist, styles, scripts, images, buildcopy);
exports.deldist = cleandist;

exports.default = parallel(/*cleandist, */styles, scripts, browsersync, startwatch);
