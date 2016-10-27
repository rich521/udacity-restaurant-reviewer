// Require node modules
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    eslint = require('gulp-eslint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-html-minifier'),
    babel = require('gulp-babel'),
    cleanCSS = require('gulp-clean-css'),
    Yelp = require('yelp');

// Create a server for socket.io and broswersync
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    port = process.env.PORT || 3000;

server.listen(3000);
console.log('Server running at: ' + port);

// For eductional and personal use
var yelp = new Yelp({
    consumer_key: 'Ax6Ioo5RmQcQN3oDUSC60Q',
    consumer_secret: 'CvvFJEYsy8_EEGgjStOfjW607vM',
    token: 'FdJ5lC6u-q0cKn4di1_1SOStX8rmOX4V',
    token_secret: '_mBxP4eNZGfGZWqo5cTQyk3Jc3g',
});

// Define source names
var jsSrc = 'src/js/**/*.js',
    jsDist = 'dist/js/**/*.js',
    jsDest = 'dist/js',
    cssDest = 'dist/css',
    sassSrc = 'src/sass/**/*.scss';

// Watch all files when changing live 
gulp.task('serve', ['sass', 'lint'], function() {
    browserSync.init({
        browser: 'google chrome',
        port: 3000,
        server: './dist'
    });

    gulp.watch(jsDist, ['lint']);
    gulp.watch(sassSrc, ['sass']);
    gulp.watch(jsSrc, ['js-watch']);
    gulp.watch('src/*.html', ['htmlfy']);
    gulp.watch("./dist/*.html").on('change', browserSync.reload);
});

gulp.task('serve:dist', function() {
    browserSync.init({
        browser: "google chrome",
        server: "./dist"
    });
});

// Watch for errors in js files
gulp.task('lint', function() {
    return gulp.src([jsSrc, '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// CSS & SASS
gulp.task('sass', function() {
    gulp.src(sassSrc)
        .pipe(sass({ style: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(cssDest))
        .pipe(cleanCSS())
        .pipe(gulp.dest(cssDest))
        .pipe(browserSync.stream());
});

// Concat & minify to production
gulp.task('minify', function() {
    return gulp.src([jsSrc])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

// Minify html for production use
gulp.task('htmlfy', function() {
    gulp.src('./src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./dist'))
});

//Only runs after minify is complete
gulp.task('js-watch', ['minify'], function(done) {
    browserSync.reload();
    done();
});

// For data processing between client and yelp servers
io.on("connection", function(socket) {
    console.log('connected!');

    socket.on("list", function(data) {
        // Recieve data from clients search query
        var term = data[0],
            location = data[1];

        // Use fetch and catch to handle yelps api data
        yelp.search({ term: term, location: location, limit: 5 })
            .then(function(data) {
                // console.log("Data from search is:");
                // console.log(data);
                // Send data out to clients
                socket.emit("results", data);
            })
            .catch(function(err) {
                console.error(err);
                socket.emit("error");
            });
    });

    socket.on('listing', function(data) {
        yelp.business(data)
            .then(function(data) {
                socket.emit("result", data);
            })
            .catch(function(err) {
                console.error(err);
                socket.emit("error");
            });
    });
});
