"use strict";
const Cesium = require("cesium");

const ForEach = require("./ForEach");

const Check = Cesium.Check;
const defined = Cesium.defined;

module.exports = forEachTextureInMaterial;

/**
 * Calls the provider handler function on each texture used by the material.
 * Mimics the behavior of functions in gltf-pipeline ForEach.
 * @param {object} material The glTF material.
 * @param {forEachTextureInMaterial~handler} handler Function that is called for each texture in the material.
 *
 * @private
 */
function forEachTextureInMaterial(material, handler) {
  Check.typeOf.object("material", material);
  Check.defined("handler", handler);

  // Metallic roughness
  const pbrMetallicRoughness = material.pbrMetallicRoughness;
  if (defined(pbrMetallicRoughness)) {
    if (defined(pbrMetallicRoughness.baseColorTexture)) {
      const textureInfo = pbrMetallicRoughness.baseColorTexture;
      const value = handler(textureInfo.index, textureInfo);
      if (defined(value)) {
        return value;
      }
    }
    if (defined(pbrMetallicRoughness.metallicRoughnessTexture)) {
      const textureInfo = pbrMetallicRoughness.metallicRoughnessTexture;
      const value = handler(textureInfo.index, textureInfo);
      if (defined(value)) {
        return value;
      }
    }
  }

  const { extensions } = material;
  if (defined(extensions)) {
    // Spec gloss extension
    const pbrSpecularGlossiness =
      extensions.KHR_materials_pbrSpecularGlossiness;
    if (defined(pbrSpecularGlossiness)) {
      if (defined(pbrSpecularGlossiness.diffuseTexture)) {
        const textureInfo = pbrSpecularGlossiness.diffuseTexture;
        const value = handler(textureInfo.index, textureInfo);
        if (defined(value)) {
          return value;
        }
      }
      if (defined(pbrSpecularGlossiness.specularGlossinessTexture)) {
        const textureInfo = pbrSpecularGlossiness.specularGlossinessTexture;
        const value = handler(textureInfo.index, textureInfo);
        if (defined(value)) {
          return value;
        }
      }
    }

    // Specular extension
    const specular = extensions.KHR_materials_specular;
    if (defined(specular)) {
      const { specularTexture, specularColorTexture } = specular;
      if (defined(specularTexture)) {
        const value = handler(specularTexture.index, specularTexture);
        if (defined(value)) {
          return value;
        }
      }
      if (defined(specularColorTexture)) {
        const value = handler(specularColorTexture.index, specularColorTexture);
        if (defined(value)) {
          return value;
        }
      }
    }

    // Materials common extension (may be present in models converted from glTF 1.0)
    const materialsCommon = extensions.KHR_materials_common;
    if (defined(materialsCommon) && defined(materialsCommon.values)) {
      const { diffuse, ambient, emission, specular } = materialsCommon.values;
      if (defined(diffuse) && defined(diffuse.index)) {
        const value = handler(diffuse.index, diffuse);
        if (defined(value)) {
          return value;
        }
      }
      if (defined(ambient) && defined(ambient.index)) {
        const value = handler(ambient.index, ambient);
        if (defined(value)) {
          return value;
        }
      }
      if (defined(emission) && defined(emission.index)) {
        const value = handler(emission.index, emission);
        if (defined(value)) {
          return value;
        }
      }
      if (defined(specular) && defined(specular.index)) {
        const value = handler(specular.index, specular);
        if (defined(value)) {
          return value;
        }
      }
    }
  }

  // KHR_techniques_webgl extension
  const value = ForEach.materialValue(material, function (materialValue) {
    if (defined(materialValue.index)) {
      const value = handler(materialValue.index, materialValue);
      if (defined(value)) {
        return value;
      }
    }
  });
  if (defined(value)) {
    return value;
  }

  // Top level textures
  if (defined(material.emissiveTexture)) {
    const textureInfo = material.emissiveTexture;
    const value = handler(textureInfo.index, textureInfo);
    if (defined(value)) {
      return value;
    }
  }

  if (defined(material.normalTexture)) {
    const textureInfo = material.normalTexture;
    const value = handler(textureInfo.index, textureInfo);
    if (defined(value)) {
      return value;
    }
  }

  if (defined(material.occlusionTexture)) {
    const textureInfo = material.occlusionTexture;
    const value = handler(textureInfo.index, textureInfo);
    if (defined(value)) {
      return value;
    }
  }
}

/**
 * Function that is called for each texture in the material. If this function returns a value the for each stops and returns that value.
 * @callback forEachTextureInMaterial~handler
 * @param {number} The texture index.
 * @param {object} The texture info object.
 *
 * @private
 */
