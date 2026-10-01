import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const gallerySection = defineType({
  name: 'gallerySection',
  title: 'Photo gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (rule) => rule.required().warning('Alt text helps accessibility and SEO'),
            }),
            defineField({name: 'caption', type: 'string'}),
          ],
        }),
      ],
      options: {layout: 'grid'},
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', media: 'images.0'},
    prepare({heading, media}) {
      return {title: headingPreview(heading) || 'Gallery', subtitle: 'Photo gallery', media: media ?? ImagesIcon}
    },
  },
})
