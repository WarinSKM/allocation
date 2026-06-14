import type {
  ConfigExtension,
  DefaultClassGroupIds,
  DefaultThemeGroupIds,
} from 'tailwind-merge'

const tailwindConfig = {
  extend: {
    theme: {
      // Add custom color names here (matches --color-* CSS vars in index.css)
      // e.g. color: ['brand', 'accent']
      color: [] as string[],
    },
    classGroups: {
      // Add custom class groups here
      // e.g. 'font-size': [{ text: ['tiny', 'huge'] }]
    },
  },
} satisfies ConfigExtension<DefaultClassGroupIds, DefaultThemeGroupIds>

export default tailwindConfig
