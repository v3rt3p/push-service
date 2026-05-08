import 'dotenv'
import { z } from 'zod'

const environmentType = z.object({
  MQTT_CA_CERTIFICATE_PATH: z.string().default('ca-cert.pem'),
  MQTT_TOPIC_PREFIX: z.string().default('bus/services/alice'),
  MQTT_URL: z.url().default('mqtts://test:test@mqtt.int.bksp.in:8883'),
  QUASAR_API_URL: z.url().default('http://server:31116'),
})

export type Environment = z.infer<typeof environmentType>

export function getEnvironment (): Environment {
  return environmentType.parse(process.env)
}
