import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {SINGLETONS, structure} from './structure'

const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'SEOSO',

  projectId: 'cerintdw',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Singletons are only reachable through Structure, never "Create new"
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETONS.includes(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter(({action}) => action && SINGLETON_ACTIONS.has(action))
        : actions,
  },
})
