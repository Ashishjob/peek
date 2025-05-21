// modelCache.js - Cache and manage model instances

const modelCache = {};

export async function loadModel(modelName) {
  if (modelCache[modelName]) {
    return modelCache[modelName];
  }
  const model = await import(`../models/${modelName}.js`);
  modelCache[modelName] = model;
  return model;
}

export function clearModelCache() {
  for (const key in modelCache) {
    delete modelCache[key];
  }
}
