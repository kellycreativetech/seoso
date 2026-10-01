import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      description:
        'The pages with slugs "events" and "news" are the listing pages at /events and /news.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'content', type: 'pageBuilder', group: 'content'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare({title, slug}) {
      return {title, subtitle: slug ? `/${slug}` : 'No slug'}
    },
  },
})
