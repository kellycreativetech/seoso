import {defineArrayMember, defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact details',
  type: 'object',
  icon: EnvelopeIcon,
  description: 'Shows the mailing address and email from Site Settings, plus any contacts below.',
  fields: [
    ...sectionHeaderFields,
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'contacts',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'contact',
          type: 'object',
          fields: [
            defineField({
              name: 'purpose',
              type: 'string',
              description: 'e.g. "Booking"',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'name', type: 'string'}),
            defineField({name: 'email', type: 'string', validation: (rule) => rule.email()}),
            defineField({name: 'phone', type: 'string'}),
          ],
          preview: {select: {title: 'purpose', subtitle: 'name'}},
        }),
      ],
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {title: headingPreview(heading) || 'Contact', subtitle: 'Contact details', media: EnvelopeIcon}
    },
  },
})
