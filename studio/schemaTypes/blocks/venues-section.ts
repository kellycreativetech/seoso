import {defineArrayMember, defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const venuesSection = defineType({
  name: 'venuesSection',
  title: 'Venues',
  type: 'object',
  icon: PinIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'venues',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'venue'}]})],
      validation: (rule) => rule.unique(),
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', venues: 'venues'},
    prepare({heading, venues}) {
      return {
        title: headingPreview(heading) || 'Venues',
        subtitle: `Venues · ${venues?.length ?? 0}`,
        media: PinIcon,
      }
    },
  },
})
