'use strict';

var Path = require('path');
var Fs = require('fs');

var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

var spawn = require('child_process').spawn;

/////////////////////////////////////////////////////
// inits
/////////////////////////////////////////////////////

var electronVer = '0.34.2';
if ( electronVer === null || electronVer === undefined ) {
    console.error( 'Can not read electron-version from package.json' );
    return;
}

function ensureDirSync(dir) {
    var fullPath = Path.join(__dirname, dir);
    if (Fs.existsSync(fullPath))
        return;

    Fs.mkdirSync(fullPath);
}

function copy(source, dist, cb) {
    var ncp = require('ncp').ncp;
    ncp(source, dist, cb);
}

/////////////////////////////////////////////////////
// downloads
/////////////////////////////////////////////////////

function checkElectronInstalled () {
    var binary = process.platform === 'win32' ? 'electron.exe' : 'Electron.app';
    if (Fs.existsSync(Path.join('bin', 'electron', binary)) &&
        Fs.existsSync(Path.join('bin', 'electron', 'version')) ) {
        var version = Fs.readFileSync(Path.join('bin', 'electron', 'version'), 'utf8');
        if (version === 'v' + electronVer) {
            console.log('Electron version ' + version + ' already installed in bin/electron.');
            return true;
        }
    }

    return false;
}

gulp.task('update-electron', function(cb) {
    if ( checkElectronInstalled() ) {
        cb();
        return;
    }
    gulpSequence('install-electron-fireshell','electron-to-bin', cb);
});

gulp.task('update-electron-official', function(cb) {
    if ( checkElectronInstalled() ) {
        cb();
        return;
    }
    gulpSequence('install-electron-official','electron-to-bin', cb);
});

function installElectron (useFireshell, cb) {
    var cmdstr = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    var arch = process.platform === 'win32' ? 'ia32' : 'x64';
    var tmpenv = process.env;
    if(useFireshell) {
        tmpenv.ELECTRON_MIRROR = 'http://7xokie.dl1.z0.glb.clouddn.com/';
    } else {
        tmpenv.ELECTRON_MIRROR = 'http://npm.taobao.org/mirrors/electron/';
    }
    var child = spawn(cmdstr, ['install', '--arch=' + arch, 'mafintosh/electron-prebuilt#v' + electronVer], {
        stdio: 'inherit',
        env: tmpenv
    });
    child.on('exit', function() {
        cb();
    });
}

gulp.task('install-electron-fireshell', function(cb) {
    installElectron(true, /* use fireshell */ cb);
});

gulp.task('install-electron-official', function(cb) {
    installElectron(false, /* use official */ cb);
});

gulp.task('electron-to-bin', function(cb) {
    var electronPath = Path.join('node_modules', 'electron-prebuilt', 'dist');
    console.log('copying electron from: ' + electronPath);

    ensureDirSync('bin');
    copy(electronPath, 'bin', function(err){
        if (err) {
            console.log('Fs.copy Error: ' + err);
            return;
        }

        console.log('Electron ' + Fs.readFileSync(Path.join(electronPath, 'version')) + ' has been download to bin/electron folder');
        cb();
    });
});
