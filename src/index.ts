import { getLogger } from './logger'

const logger = getLogger()

const greet = 'hello'

const newGreet = greet.toUpperCase()

logger.info({ foo: true }) //eslint-disable-line
