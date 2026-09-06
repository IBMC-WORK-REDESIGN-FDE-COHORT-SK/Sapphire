import { gql } from '@apollo/client';

export const GET_LATEST_TEMPERATURE = gql`
  query GetLatestTemperature($userId: ID) {
    latestTemperature(userId: $userId) {
      id
      userId
      timestamp
      value
      unit
      normalizedValueCelsius
      status
      sourceDeviceId
      measurementMethod
    }
  }
`;

export const GET_TEMPERATURE_TRENDS = gql`
  query GetTemperatureTrends($userId: ID, $period: String, $unit: TemperatureUnit) {
    temperatureTrends(userId: $userId, period: $period, unit: $unit) {
      period
      unit
      overallAvg
      overallMin
      overallMax
      dataPoints {
        timestamp
        min
        max
        avg
        sampleCount
      }
    }
  }
`;
