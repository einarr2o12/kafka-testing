const { Kafka } = require('kafkajs');

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: process.env.KAFKA_BROKERS.split(',')
    });
    
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
  }

  async connect() {
    await this.producer.connect();
    await this.consumer.connect();
    console.log('Connected to Kafka');
  }

  async disconnect() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publishMessage(topic, message) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
            timestamp: Date.now().toString()
          }
        ]
      });
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  async subscribeToMessages(topic, callback) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageData = JSON.parse(message.value.toString());
          callback(messageData);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    });
  }
}

module.exports = KafkaService;