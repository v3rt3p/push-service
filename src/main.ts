import { connect } from 'mqtt'
import fs from 'node:fs'

import { getEnvironment } from './environment'
import { getLogger } from './logger'

const logger = getLogger()
const environment = getEnvironment()

const client = connect(environment.MQTT_URL, {
  ca: [fs.readFileSync(environment.MQTT_CA_CERTIFICATE_PATH)]
})

const mqttAllTopic = `${environment.MQTT_TOPIC_PREFIX}/event`
const mqttAllRawTopic = `${environment.MQTT_TOPIC_PREFIX}/event/raw`
const mqttDeviceTopic = `${environment.MQTT_TOPIC_PREFIX}/+/event`
const mqttDeviceRawTopic = `${environment.MQTT_TOPIC_PREFIX}/+/event/raw`
const mqttDeviceTopicRegex = new RegExp(`^${environment.MQTT_TOPIC_PREFIX}/([A-Z0-9]+)/event$`)
const mqttDeviceRawTopicRegex = new RegExp(`^${environment.MQTT_TOPIC_PREFIX}/([A-Z0-9]+)/event/raw$`)

const topics = [
  mqttAllTopic,
  mqttAllRawTopic,
  mqttDeviceTopic,
  mqttDeviceRawTopic
]

client.on('connect', () => {
  logger.info('Connected to MQTT')

  for (const topic of topics) {
    client.subscribe(topic, error => {
      if (!error) {
        logger.info(`Subscribed to ${topic}`)
        return
      }
      logger.info(`Failed to subscribe to ${topic}: ${error}`)
    })
  }
})

client.on('error', error => {
  logger.warn(`MQTT error: ${error}`)
})

client.on('message', (topic, payload) => {
  if (topic === mqttAllRawTopic) {
    const text = payload.toString('utf8')
    for (const url of environment.API_URLS) {
      fetch(`${url}/devices/all/push-raw`, {
        body: JSON.stringify({
          eventText: text
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).catch(error => {
        logger.error(`Failed to push event: ${error}`)
      })
    }
    return
  }
  if (topic === mqttAllTopic) {
    const text = payload.toString('utf8')
    for (const url of environment.API_URLS) {
      fetch(`${url}/devices/all/push`, {
        body: JSON.stringify({
          eventText: text
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).catch(error => {
        logger.error(`Failed to push event: ${error}`)
      })
    }
  }
  {
    const matches = mqttDeviceTopicRegex.exec(topic)
    if (matches) {
      const text = payload.toString('utf8')
      for (const url of environment.API_URLS) {
        fetch(`${url}/devices/${matches[1]}/push`, {
          body: JSON.stringify({
            eventText: text
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }).catch(error => {
          logger.error(`Failed to push event: ${error}`)
        })
      }
    }
  }
  {
    const matches = mqttDeviceRawTopicRegex.exec(topic)
    if (matches) {
      const text = payload.toString('utf8')
      for (const url of environment.API_URLS) {
        fetch(`${url}/devices/${matches[1]}/push-raw`, {
          body: JSON.stringify({
            eventText: text
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }).catch(error => {
          logger.error(`Failed to push event: ${error}`)
        })
      }
    }
  }
})
