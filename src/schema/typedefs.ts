import { loadFilesSync } from 'graphql-tools'

const typedefs = loadFilesSync(`${__dirname}/**/*.gql`)

export default typedefs
