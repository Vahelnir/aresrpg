import protodef from 'protodef'
import { version } from './settings.js'
import minecraft_data from 'minecraft-data'
import minecraft_types from 'minecraft-protocol/src/datatypes/minecraft.js'

const mc_data = minecraft_data(version)

const BRAND_CHANNEL = 'minecraft:brand'
const DEBUG_PATH_CHANNEL = 'minecraft:debug/paths'
const DEBUG_GAME_TEST_ADD_MARKER_CHANNEL =
  'minecraft:debug/game_test_add_marker'
const DEBUG_GAME_TEST_CLEAR = 'minecraft:debug/game_test_clear'

const proto = new protodef.ProtoDef()

proto.addTypes(mc_data.protocol.types)
proto.addTypes(minecraft_types)

proto.addType(BRAND_CHANNEL, 'string')

proto.addType('path_point', [
  'container',
  [
    { name: 'x', type: 'i32' },
    { name: 'y', type: 'i32' },
    { name: 'z', type: 'i32' },
    { name: 'origin_distance', type: 'f32' },
    { name: 'cost', type: 'f32' },
    { name: 'cost_malus', type: 'f32' },
    { name: 'visited', type: 'bool' },
    { name: 'type', type: 'i32' },
    { name: 'target_distance', type: 'f32' },
  ],
])

proto.addType('path', [
  'container',
  [
    { name: 'current_path_index', type: 'i32' },
    { name: 'target', type: 'path_point' },
    {
      name: 'points',
      type: [
        'array',
        {
          countType: 'i32',
          type: 'path_point',
        },
      ],
    },
    {
      name: 'open_set',
      type: [
        'array',
        {
          countType: 'i32',
          type: 'path_point',
        },
      ],
    },
    {
      name: 'closed_set',
      type: [
        'array',
        {
          countType: 'i32',
          type: 'path_point',
        },
      ],
    },
  ],
])

proto.addType(DEBUG_PATH_CHANNEL, [
  'container',
  [
    { name: 'entityId', type: 'i32' },
    { name: 'radius', type: 'f32' },
    { name: 'path', type: 'path' },
  ],
])

proto.addType(DEBUG_GAME_TEST_ADD_MARKER_CHANNEL, [
  'container',
  [
    { name: 'location', type: 'position' },
    { name: 'color', type: 'i32' },
    { name: 'name', type: 'string' },
    { name: 'destroy_after', type: 'i32' },
  ],
])

const channels = [BRAND_CHANNEL]

export function register_plugin_channels({ client, position }) {
  client.on('custom_payload', ({ channel, data: raw_data }) => {
    if (channels.includes(channel)) {
      const { data } = proto.parsePacketBuffer(channel, raw_data)
      client.emit(channel, data)
    }
  })

  client.on(BRAND_CHANNEL, (brand) => console.log('Client brand:', brand))
}

export function write_brand(client, { brand }) {
  client.write('custom_payload', {
    channel: BRAND_CHANNEL,
    data: proto.createPacketBuffer(BRAND_CHANNEL, brand),
  })
}

export function write_add_test_marker(client, marker) {
  client.write('custom_payload', {
    channel: DEBUG_GAME_TEST_ADD_MARKER_CHANNEL,
    data: proto.createPacketBuffer(DEBUG_GAME_TEST_ADD_MARKER_CHANNEL, marker),
  })
}

export function write_clear_test_markers(client) {
  client.write('custom_payload', {
    channel: DEBUG_GAME_TEST_CLEAR,
    data: [],
  })
}
