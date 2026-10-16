import {defineArrayMember, defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {headingPreview, sectionHeaderFields} from './shared'

export const highlightBand = defineType({
  name: 'highlightBand',
  title: 'Highlight band',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'figure',
      type: 'image',
      description:
        'Optional square image beside the copy, e.g. a product cutout. A transparent PNG reads best on the black band.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe what the image shows.',
          validation: (rule) =>
            rule.custom((alt, context) => {
              const figure = context.parent as {asset?: unknown} | undefined
              return figure?.asset && !alt ? 'Alternative text is required' : true
            }),
        }),
      ],
    }),
    ...sectionHeaderFields.map((field) =>
      field.name === 'heading'
        ? defineField({
            name: 'heading',
            type: 'headingTextWithStrike',
            description:
              'Select words and press ⌘I to set them in italics, or use the strikethrough button to cross them out.',
          })
        : field,
    ),
    defineField({name: 'body', type: 'text', rows: 3}),
    defineField({
      name: 'actions',
      type: 'array',
      of: [defineArrayMember({type: 'link'})],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: {heading: 'heading', media: 'figure'},
    prepare({heading, media}) {
      return {
        title: headingPreview(heading) || 'Untitled',
        subtitle: 'Highlight band',
        media: media ?? SparklesIcon,
      }
    },
  },
})
