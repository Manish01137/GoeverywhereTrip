// Same content the app uses: last synced live content, else the built-in data files.
import { readFileSync } from 'node:fs'
import { trips as builtInTrips } from '../src/data/trips.js'
import { blogs as builtInBlogs } from '../src/data/blogs.js'

const live = JSON.parse(readFileSync(new URL('../src/data/live-content.json', import.meta.url), 'utf8') || '{}')
export const trips = live.trips || builtInTrips
export const blogs = live.blogs || builtInBlogs
