import protocol from 'minecraft-protocol'
import EventEmitter from 'events'

import { version, online_mode } from './settings.js'
import login from './login.js'
import { floor1 as world } from './world.js'
import update_chunks from './chunk/update.js'
import { position_change_event } from './events.js'
import { chunk_change_event, chunk_position } from './chunk.js'
import logger from './logger.js'

const log = logger(import.meta)

const server = protocol.createServer({ version, 'online-mode': online_mode })

server.on('login', (client) => {
  const state = {
    client,
    world,
    position: world.spawn_position,
    chunk: {
      x: chunk_position(world.spawn_position.x),
      z: chunk_position(world.spawn_position.z),
    },
    events: new EventEmitter(),
    gameMode: 1,
  }

  login(state)
  position_change_event(state)
  chunk_change_event(state)
  update_chunks(state)
})

server.on('listening', () => {
  log.info(server.socketServer.address(), 'Listening')
})

process.on('unhandledRejection', (error) => {
  throw error
})
