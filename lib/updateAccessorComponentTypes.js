"use strict";
const Cesium = require("cesium");
const addBuffer = require("./addBuffer");
const ForEach = require("./ForEach");
const readAccessorPacked = require("./readAccessorPacked");

const ComponentDatatype = Cesium.ComponentDatatype;
const WebGLConstants = Cesium.WebGLConstants;

module.exports = updateAccessorComponentTypes;

/**
 * Update accessors referenced by JOINTS_0 and WEIGHTS_0 attributes to use correct component types.
 *
 * @param {object} gltf A javascript object containing a glTF asset.
 * @returns {object} The glTF asset with compressed meshes.
 *
 * @private
 */
function updateAccessorComponentTypes(gltf) {
  let componentType;
  ForEach.accessorWithSemantic(gltf, "JOINTS_0", function (accessorId) {
    const accessor = gltf.accessors[accessorId];
    componentType = accessor.componentType;
    if (componentType === WebGLConstants.BYTE) {
      convertType(gltf, accessor, ComponentDatatype.UNSIGNED_BYTE);
    } else if (
      componentType !== WebGLConstants.UNSIGNED_BYTE &&
      componentType !== WebGLConstants.UNSIGNED_SHORT
    ) {
      convertType(gltf, accessor, ComponentDatatype.UNSIGNED_SHORT);
    }
  });
  ForEach.accessorWithSemantic(gltf, "WEIGHTS_0", function (accessorId) {
    const accessor = gltf.accessors[accessorId];
    componentType = accessor.componentType;
    if (componentType === WebGLConstants.BYTE) {
      convertType(gltf, accessor, ComponentDatatype.UNSIGNED_BYTE);
    } else if (componentType === WebGLConstants.SHORT) {
      convertType(gltf, accessor, ComponentDatatype.UNSIGNED_SHORT);
    }
  });

  return gltf;
}

function convertType(gltf, accessor, updatedComponentType) {
  const typedArray = ComponentDatatype.createTypedArray(
    updatedComponentType,
    readAccessorPacked(gltf, accessor)
  );
  const newBuffer = new Uint8Array(typedArray.buffer);
  accessor.bufferView = addBuffer(gltf, newBuffer);
  accessor.componentType = updatedComponentType;
  accessor.byteOffset = 0;
}
