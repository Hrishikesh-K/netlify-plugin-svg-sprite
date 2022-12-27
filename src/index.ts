import type {NetlifyPlugin, NetlifyPluginOptions} from '@netlify/build'
import {cwd} from 'process'
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs'
import {resolve} from 'path'
import {watch} from 'chokidar'
// noinspection AnonymousFunctionJS, FunctionWithMultipleReturnPointsJS, JSUnusedGlobalSymbols
export default function(inputs : NetlifyPluginOptions['inputs'], meta? : {
  events : Set<string>
}) : NetlifyPlugin & {
  onPreDev? : NetlifyPlugin['onPreBuild']
} {
  // noinspection NestedFunctionCallJS
  const workingDir = resolve(cwd())
  let distDir = inputs['dist'] as string | undefined
  let inputDir = inputs['src'] as string | undefined
  // noinspection FunctionWithMoreThanThreeNegationsJS, NestedFunctionJS
  function createSprites(plugin : NetlifyPluginOptions) {
    if (!inputDir) {
      // noinspection ReuseOfLocalVariableJS
      inputDir = './src/icons'
      console.warn(`The source directory for icons is not specified. The plugin will fallback to ${inputDir}.\n`)
      // noinspection NestedFunctionCallJS
      if (!existsSync(resolve(workingDir, inputDir))) {
        plugin.utils.build.failPlugin(`${inputDir} does not exist.`)
      }
    }
    if (!distDir) {
      // noinspection ReuseOfLocalVariableJS
      distDir = plugin.netlifyConfig.build.publish
      console.warn(`The source directory for icons is not specified. The plugin will fallback to ${distDir}.\n`)
    }
    const fileNames : Array<string> = []
    const resolvedDistDir = resolve(workingDir, distDir)
    const resolvedInputDir = resolve(workingDir, inputDir)
    if (!existsSync(resolvedDistDir)) {
      console.warn('The dist directory for sprite is not specified. The plugin will now create it. However, most site generators will delete this diretory before starting a new build. It is recommended to specify a different dist directory in your netlify.toml file.\n')
      mkdirSync(resolvedDistDir)
      console.log(`${distDir} successfully created.\n`)
    }
    // noinspection NestedFunctionJS
    function writeSprites() {
      // noinspection AnonymousFunctionJS, ChainedFunctionCallJS, NestedFunctionCallJS
      writeFileSync(resolve(resolvedDistDir, './sprites.svg'), `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">${readdirSync(resolvedInputDir).reduce((previousString, currentFileName) => {
        fileNames.push(currentFileName)
        console.log(`${currentFileName} successfully processed\n`)
        // noinspection ChainedFunctionCallJS, NestedFunctionCallJS
        return previousString + readFileSync(resolve(resolvedInputDir, currentFileName), 'utf-8').replace('<svg', `<symbol id="${currentFileName.slice(0, -4)}"`).replace('</svg', '</symbol')
      }, '')}</svg>`)
    }
    plugin.utils.status.show({
      summary: `SVG sprite created from ${fileNames.length} file(s)`,
      text: `Sprite(s) include:\n${fileNames.join(',\n')}`,
      title: 'Netlify Plugin SVG Sprite',
    })
    // noinspection ConstantOnRightSideOfComparisonJS
    if (process.env['CONTEXT'] === 'dev') {
      // noinspection AnonymousFunctionJS, ChainedFunctionCallJS
      watch(resolvedInputDir, {
        awaitWriteFinish: true
      }).on('all', () => {
        writeSprites()
      })
    }
    writeSprites()
  }
  if (meta?.events.has('onPreDev')) {
    return {
      onPreBuild: createSprites,
      onPreDev: createSprites
    }
  } else {
    return {
      onEnd: (plugin) => {
        plugin.utils.status.show({
          summary: 'To run build plugins during development, please make sure you are using Netlify CLI v11.0.0 or newer',
          text: 'Unsupported Netlify CLI version',
          title: 'Netlify Plugin SVG Sprite',
        })
      },
      onPreBuild: createSprites
    }
  }
}