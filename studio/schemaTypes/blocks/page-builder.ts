import {defineArrayMember, defineType} from 'sanity'

export const pageBuilder = defineType({
  name: 'pageBuilder',
  title: 'Page sections',
  type: 'array',
  of: [
    defineArrayMember({type: 'hero'}),
    defineArrayMember({type: 'eventsSection'}),
    defineArrayMember({type: 'highlightBand'}),
    defineArrayMember({type: 'newsSection'}),
    defineArrayMember({type: 'textSection'}),
    defineArrayMember({type: 'peopleSection'}),
    defineArrayMember({type: 'contactSection'}),
    defineArrayMember({type: 'venuesSection'}),
    defineArrayMember({type: 'gallerySection'}),
    defineArrayMember({type: 'videoSection'}),
  ],
})
