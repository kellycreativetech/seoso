import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {resolve} from './presentation/resolve'
import {SINGLETONS, structure} from './structure'

// The local Studio previews the local site; the hosted Studio previews production.
const PREVIEW_ORIGIN =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://seoso.netlify.app'

const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'SEOSO',

  projectId: 'cerintdw',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        initial: PREVIEW_ORIGIN,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
      // Local dev, production and Netlify deploy previews
      allowOrigins: ['http://localhost:*', 'https://seoso.netlify.app', 'https://*--seoso.netlify.app'],
    }),
    visionTool(),
  ],

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
