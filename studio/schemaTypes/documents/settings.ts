import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

export const settings = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'navigation', title: 'Navigation'},
    {name: 'contact', title: 'Contact & social'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site title',
      type: 'string',
      group: 'general',
      description: 'Short name used in browser tabs, e.g. "SEOSO".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'organizationName',
      title: 'Organization name',
      type: 'string',
      group: 'general',
      description: 'Full legal name, shown in the footer.',
    }),
    defineField({
      name: 'tagline',
      type: 'string',
      group: 'general',
      description: 'Shown under the logo in the footer, e.g. "Music for All".',
    }),
    defineField({
      name: 'description',
      title: 'Default meta description',
      type: 'text',
      rows: 3,
      group: 'general',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      group: 'general',
      description: 'Shown on black. Use a version with light lettering.',
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'homePage',
      title: 'Home page',
      type: 'reference',
      group: 'general',
      to: [{type: 'page'}],
      description: 'The page rendered at the site root.',
    }),
    defineField({
      name: 'defaultSeoImage',
      title: 'Default social share image',
      type: 'image',
      group: 'general',
    }),
    defineField({
      name: 'navigation',
      title: 'Main navigation',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({type: 'navItem'})],
    }),
    defineField({
      name: 'donateLink',
      title: 'Donate button',
      type: 'link',
      group: 'navigation',
      description: 'Shown as a button at the end of the main navigation.',
    }),
    defineField({
      name: 'footerNavigation',
      title: 'Footer navigation',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({type: 'link'})],
    }),
    defineField({
      name: 'mailingAddress',
      title: 'Mailing address',
      type: 'text',
      rows: 3,
      group: 'contact',
    }),
    defineField({
      name: 'email',
      title: 'General email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          name: 'socialLink',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'YouTube', value: 'youtube'},
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['https']}),
            }),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
