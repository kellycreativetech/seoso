import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'

export const venue = defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'city',
      type: 'string',
      description: 'Shown under the venue name in event listings.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'address', type: 'text', rows: 2}),
    defineField({name: 'directions', type: 'text', rows: 4}),
    defineField({
      name: 'website',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'city', media: 'image'},
  },
})
