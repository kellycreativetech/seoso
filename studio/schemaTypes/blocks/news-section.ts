import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const newsSection = defineType({
  name: 'newsSection',
  title: 'News',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'limit',
      type: 'number',
      description: 'Number of latest posts to show. Leave empty to show all.',
      initialValue: 1,
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({name: 'footerLink', title: 'Footer link', type: 'link'}),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', limit: 'limit'},
    prepare({heading, limit}) {
      return {
        title: headingPreview(heading) || 'News',
        subtitle: `News · ${limit ? `latest ${limit}` : 'all posts'}`,
        media: DocumentTextIcon,
      }
    },
  },
})
