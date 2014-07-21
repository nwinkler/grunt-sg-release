'use strict';


var inquirer = require('inquirer');
var gitHelper = require('./lib/helpers/git');
var dependenciesHelper = require('./lib/helpers/dependencies');
var messages = require('./lib/messages');
var version = require('./lib/version');

module.exports = function (grunt) {

  grunt.task.loadNpmTasks('grunt-bump');


  // ---


  grunt.registerTask('prepare_sg_release', function () {

    var done = this.async();
    var options = this.options({
      tempReleaseBranch: 'release'
    });

    function checkGit() {
      gitHelper.check(grunt);
      checkNpmInstall();
    }

    function checkNpmInstall() {
      dependenciesHelper.checkInstall(grunt, process.cwd(), 'npm', checkBowerInstall);
    }

    function checkBowerInstall() {
      dependenciesHelper.checkInstall(grunt, process.cwd(), 'bower', getReleaseVersion);
    }

    function getReleaseVersion() {
      version.getRelease(grunt, checkoutTempReleaseBranch);
    }

    function checkoutTempReleaseBranch() {
      var branchName = '-b ' + options.tempReleaseBranch + '/v' + grunt.option('setversion');
      gitHelper.checkout(grunt, process.cwd(), branchName, done);
    }

    (function start() {
      checkGit();
    })();

  });


  // ---


  grunt.registerTask('merge_sg_release', function () {

    var done = this.async();
    var options = this.options({
      masterBranch: 'master',
      mergeToMasterMsg: 'Merge into master'
    });

    function checkoutMaster() {
      gitHelper.checkout(grunt, process.cwd(), options.masterBranch, mergeFromTempReleaseBranch);
    }

    function mergeFromTempReleaseBranch() {
      gitHelper.merge(grunt, process.cwd(), options.tempReleaseBranch, options.mergeToMasterMsg, done);
    }

    (function start() {
      checkoutMaster();
    })();

  });


  // ---


  grunt.registerMultiTask('sg_release', 'The SunGard standard release script for HTML5 projects.', function () {

    grunt.task.run('prepare_sg_release');
    grunt.task.run('bump-only');
    grunt.task.run('merge_sg_release');

  });

};

