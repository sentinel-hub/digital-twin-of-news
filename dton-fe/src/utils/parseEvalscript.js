import { parseScript } from 'esprima';

export function isEvalscriptMultitemporal(evalscript) {
  let mosaicking;
  try {
    const parsed = parseScript(evalscript, { jsx: true, tolerant: true });
    mosaicking = getMosaicking(parsed);
  } catch (err) {
    console.error(err);
  }

  if (mosaicking && ['ORBIT', 'TILE'].includes(mosaicking.value.value)) {
    return true;
  }
  return false;
}

function getMosaicking(tree) {
  const setupFunction = tree.body.find((d) => d.id && d.id.name === 'setup');
  const mosaicking = setupFunction.body.body[0].argument.properties.find((p) => p.key.name === 'mosaicking');
  return mosaicking;
}
