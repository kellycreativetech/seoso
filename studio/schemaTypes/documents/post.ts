import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Details'},
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'One- or two-sentence summary, set large when the post is featured.',
      validation: (rule) => rule.max(200).warning('Keep it under 200 characters'),
    }),
    defineField({
      name: 'summary',
      type: 'inlineRichText',
      group: 'content',
      description: 'Supporting paragraph shown under the excerpt when the post is featured.',
    }),
    defineField({
      name: 'facts',
      title: 'Key facts',
      type: 'array',
      group: 'content',
      description: 'Short label/value pairs shown when the post is featured, e.g. Tickets · $20.',
      of: [
        defineArrayMember({
          name: 'fact',
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'value', type: 'string', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        }),
      ],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({name: 'body', type: 'blockContent', group: 'content'}),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'meta',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {
      title: 'Published, newest',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', author: 'author.name', media: 'mainImage'},
    prepare({title, author, media}) {
      return {title, subtitle: author ? `by ${author}` : undefined, media}
    },
  },
})
