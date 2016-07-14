'use strict';
var fs = require('fs');

var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);

var path = require('path');
var clone = require('clone');
var async = require('async');
var bufferEqual = require('buffer-equal');
var addPipelineExtras = require('../../lib/addPipelineExtras');
var getBinaryGltf = require('../../lib/getBinaryGltf');
var loadGltfUris = require('../../lib/loadGltfUris');
var readGltf = require('../../lib/readGltf');
var removeUnused = require('../../lib/removeUnused');
var writeBinaryGltf = require('../../lib/writeBinaryGltf');

var gltfPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest_BinaryInput.gltf';
var scenePath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest_BinaryCheck.gltf';
var outputPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest.glb';
var bufferPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest.bin';
var imagePath = './specs/data/boxTexturedUnoptimized/Cesium_Logo_Flat_Binary.png';
var fragmentShaderPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest0FS_Binary.glsl';
var vertexShaderPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest0VS_Binary.glsl';
var invalidPath = './specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest.gltf';


describe('getBinaryGltf', function() {

    var testData = {
        gltf: gltfPath,
        scene: scenePath,
        image: imagePath,
        buffer: bufferPath,
        fragmentShader: fragmentShaderPath,
        vertexShader: vertexShaderPath
    };

    beforeAll(function (done) {
        var options = {};
        readGltf(gltfPath, options)
            .then(function (gltf) {
                testData.gltf = gltf;

                fs.readFile(scenePath, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    testData.scene = JSON.parse(data);

                    var readFiles = [
                        readFile(testData.image),
                        readFile(testData.buffer),
                        readFile(testData.fragmentShader),
                        readFile(testData.vertexShader)
                    ];
                    Promise.all(readFiles)
                        .then(function (results) {
                            testData.image = results[0];
                            testData.buffer = results[1];
                            testData.fragmentShader = results[2];
                            testData.vertexShader = results[3];
                            done();
                        });
                });
            });
    });


    it('writes a valid binary gltf header with embedded resources', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, true, true);
        var header = glbData.header;

        expect(header.toString('utf8', 0, 4)).toEqual('glTF');
        expect(header.readUInt32LE(4)).toEqual(1);
        expect(header.readUInt32LE(8)).toEqual(17706);
        expect(header.readUInt32LE(12)).toEqual(3896);
        expect(header.readUInt32LE(16)).toEqual(0);
    });

    it('writes a valid binary gltf header with separate resources', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, false, false);
        var header = glbData.header;

        expect(header.toString('utf8', 0, 4)).toEqual('glTF');
        expect(header.readUInt32LE(4)).toEqual(1);
        expect(header.readUInt32LE(8)).toEqual(4336);
        expect(header.readUInt32LE(12)).toEqual(3476);
        expect(header.readUInt32LE(16)).toEqual(0);
    });

    it('writes the correct binary scene', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, true, true);
        var scene = glbData.scene;
        expect(JSON.parse(scene.toString())).toEqual(testData.scene);
    });

    it('writes the correct binary body with embedded resources', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, true, true);
        var body = glbData.body;

        var binaryBody = Buffer.concat([testData.buffer, testData.fragmentShader, testData.vertexShader, testData.image]);
        expect(bufferEqual(binaryBody, body)).toBe(true);
    });

    it('writes the correct binary body with separate images', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, true, false);
        var body = glbData.body;

        var binaryBody = Buffer.concat([testData.buffer, testData.fragmentShader, testData.vertexShader]);
        expect(bufferEqual(binaryBody, body)).toBe(true);
    });

    it('writes the correct binary body with separate resources except images', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, false, true);
        var body = glbData.body;

        var binaryBody = Buffer.concat([testData.buffer, testData.image]);
        expect(bufferEqual(binaryBody, body)).toBe(true);
    });

    it('writes the correct binary body with separate resources', function () {
        var gltf = clone(testData.gltf);
        var glbData = getBinaryGltf(gltf, false, false);
        var body = glbData.body;
        
        var binaryBody = testData.buffer;
        expect(bufferEqual(binaryBody, body)).toBe(true);
    });
});
