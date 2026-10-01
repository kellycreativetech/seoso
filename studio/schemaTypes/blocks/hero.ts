import {defineArrayMember, defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'
import {headingPreview, sectionHeaderFields} from './shared'

export const hero = defineType({
  name: 'hero',
  title: 'Masthead',
  type: 'object',
  icon: StarIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({name: 'lead', type: 'text', rows: 3}),
    defineField({
      name: 'actions',
      type: 'array',
      of: [defineArrayMember({type: 'link'})],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: 'image',
      type: 'image',
      description: 'Wide photo that fades into the black masthead. Leave empty for interior pages.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Leave empty if the photo is purely decorative.',
        }),
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading', media: 'image'},
    prepare({heading, media}) {
      return {title: headingPreview(heading) || 'Untitled', subtitle: 'Masthead', media: media ?? StarIcon}
    },
  },
})
