import {defineArrayMember, defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const videoSection = defineType({
  name: 'videoSection',
  title: 'Videos',
  type: 'object',
  icon: PlayIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'videos',
      type: 'array',
      description: 'YouTube videos, embedded with privacy-enhanced mode.',
      of: [
        defineArrayMember({
          name: 'video',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'description', type: 'text', rows: 2}),
            defineField({
              name: 'youtubeId',
              title: 'YouTube video ID',
              type: 'string',
              description: 'The ID after "watch?v=" or "youtu.be/", e.g. Wvj1FS44Jok',
              validation: (rule) => rule.required().regex(/^[A-Za-z0-9_-]{11}$/, {name: 'YouTube ID'}),
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'youtubeId'}},
        }),
      ],
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', videos: 'videos'},
    prepare({heading, videos}) {
      return {
        title: headingPreview(heading) || 'Videos',
        subtitle: `Videos · ${videos?.length ?? 0}`,
        media: PlayIcon,
      }
    },
  },
})
