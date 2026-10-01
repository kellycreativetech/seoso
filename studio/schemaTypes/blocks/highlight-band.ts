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
      type: 'string',
      description: 'Optional large figure, e.g. "50". Keep it to a few characters.',
      validation: (rule) => rule.max(4),
    }),
    ...sectionHeaderFields,
    defineField({name: 'body', type: 'text', rows: 3}),
    defineField({
      name: 'actions',
      type: 'array',
      of: [defineArrayMember({type: 'link'})],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: {heading: 'heading', figure: 'figure'},
    prepare({heading, figure}) {
      return {
        title: headingPreview(heading) || 'Untitled',
        subtitle: `Highlight band${figure ? ` · ${figure}` : ''}`,
        media: SparklesIcon,
      }
    },
  },
})
