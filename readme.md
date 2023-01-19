## Netlify Plugin SVG Sprite

A Netlify build plugin to generate SVG sprite from a folder containing SVG files.

### Motivation:

Almost all websites need some sort of icons on their website. The most common solutions include using Icon Fonts. These are heavy and include a lot of unwanted icons, not to mention the deadly FOUC (Flash of Un-styled Content) that comes with them. Loading individual SVG files is an option, but in a world where we have modular, component-based projects, we need a write once and forget solution.

### Working:

This plugin takes all SVG files in a folder and generates a single SVG sprite file. This file can then be included in the HTML and used as a single source of icons. You can use the pre-determined URL in your HTML, CSS or JS files.

### Installation:

Add the following to your `netlify.toml` file:

```toml
[[plugins]]
  package = "netlify-plugin-svg-sprite"
  [plugins.inputs]
    dist = "./dist/"
    src = "./src/icons/"
```

and run `npm i netlify-plugin-svg-sprite` to make sure the plugin is added as a dependency.

#### Options:

| Name | Description                                                              | Required              | Default           |
|------|--------------------------------------------------------------------------|-----------------------|-------------------|
| dist | Folder to save the output SVG sprite in (relative to the base directory) | No                    | Publish directory |
| src  | Folder containing SVG files to process                                   | No (but, recommended) | ./src/icons/      |

### Usage:

Create a directory containing all the SVG files that you wish to use as icons. Note that, consistency is highly recommended. Here's how a typical SVG file should look:

```svg
<svg viewBox="0 0 48 48"><path d="M24,38a4,4,0,0,1-2.83-1.17l-20-20a4,4,0,0,1,5.66-5.66L24,28.35,41.17,11.18a4,4,0,0,1,5.66,5.65l-20,20A4,4,0,0,1,24,38Z"/></svg>
```

As you can see, the `height` and `width` attributes have been eliminated so you can style the sizing with CSS. Due to this, the `viewBox` attribute is required. Each file should have a unique name. The name of the file will be used as the ID of the SVG element in the sprite.

For example, if the above file is named `angle-down.svg`, the ID of the SVG element will be `#angle-down`.

It is recommended to create a component. For example, in Vue, this can be done like:

```vue
<script
  setup
  lang="ts">
  import sprite from '/sprites.svg'
  const iconProps = withDefaults(defineProps<{
    name : string
    size? : number
  }>(), {
    name: '',
    size: 4
  })
</script>
<template>
  <svg
    u-display="block"
    u-svg="fill-current"
    v-bind:u-h="iconProps.size"
    v-bind:u-w="iconProps.size">
    <use
      v-bind:xlink:href="`${sprite}#${iconProps.name}`"/>
  </svg>
</template>
<!--
  <safe
    u-h="4"
    u-w="4"/>
-->
```

You can then use it in other templates like:

```vue
<script
  setup
  lang="ts">
  import iconComponent from './icon.vue'
</script>
<template>
  <IconComponent
    name="angle-down"/>
</template>
```

The above example uses UnoCSS in attributify mode for styling. You can use any other way to apply CSS styles.