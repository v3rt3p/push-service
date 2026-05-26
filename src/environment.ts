import 'dotenv'
import { z } from 'zod'

const environmentType = z.object({
  API_URLS: z.string().default('http://server:31116').transform(item => item.split(',')),
  MQTT_CA_CERTIFICATE_PATH: z.string().default('ca-cert.pem'),
  MQTT_TOPIC_PREFIX: z.string().default('bus/services/alice'),
  MQTT_URL: z.url().default('mqtts://test:test@mqtt.int.bksp.in:8883'),
})

export type Environment = z.infer<typeof environmentType>

export function getEnvironment (): Environment {
  return environmentType.parse(process.env)
}
