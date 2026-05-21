#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  if (!mpu.begin()) {
    while (1) delay(10);
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  bool shake = abs(g.gyro.x) > 5 || abs(g.gyro.y) > 5 || abs(g.gyro.z) > 5;

  Serial.print("{\"ax\":");
  Serial.print(a.acceleration.x);
  Serial.print(",\"ay\":");
  Serial.print(a.acceleration.y);
  Serial.print(",\"az\":");
  Serial.print(a.acceleration.z);
  Serial.print(",\"gx\":");
  Serial.print(g.gyro.x);
  Serial.print(",\"gy\":");
  Serial.print(g.gyro.y);
  Serial.print(",\"gz\":");
  Serial.print(g.gyro.z);
  Serial.print(",\"shake\":");
  Serial.print(shake ? "true" : "false");
  Serial.println(",\"shakeDurationMs\":0}");

  delay(100);
}