import {defineArrayMember, defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const peopleSection = defineType({
  name: 'peopleSection',
  title: 'People',
  type: 'object',
  icon: UsersIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'people',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'person',
          type: 'object',
          fields: [
            defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'role', type: 'string'}),
            defineField({name: 'email', type: 'string', validation: (rule) => rule.email()}),
          ],
          preview: {select: {title: 'name', subtitle: 'role'}},
        }),
      ],
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', people: 'people'},
    prepare({heading, people}) {
      return {
        title: headingPreview(heading) || 'People',
        subtitle: `People · ${people?.length ?? 0}`,
        media: UsersIcon,
      }
    },
  },
})
