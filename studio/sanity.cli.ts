import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'cerintdw',
    dataset: 'production'
  },
  deployment: {
    appId: 'mafifd37mmffsd4hfyfk71z4',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx,js,jsx}',
    schema: 'schema.json',
    generates: '../web/src/sanity/types.ts',
    overloadClientMethods: true,
  },
})
