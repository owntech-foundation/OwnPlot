## Dev board demo code

In order to transmit data to OwnPlot, your device must send data through a serial port.
This serial port on dev boards is in most cases USB based.

This page will provide you with sample codes that will make those dev boards "talk" in the serial port.

## Sawtooth demo code
This code will generate sawteeth with ASCII formatting.

You can change the number of datasets by modifying the `#define numberOfTriangles 3` statement. The default value is 3.
=== "SPIN"
	!!! info
		If you need to familiarize yourself with OwnTech's SDK, please start [here](../../../../core/docs/environment_setup/)

	``` C
	#include "TaskAPI.h"
	#include "SpinAPI.h"
	#include "zephyr/console/console.h"

	void setup_routine();
	void loop_communication_task();
	void initTriangles();
	int main();

	#define numberOfTriangles 3
	uint16_t maxValue = 256;
	uint8_t triangles[numberOfTriangles];
	uint8_t numberPoints = 4;
	uint8_t received_serial_char;
	uint8_t state = 1;

	void setup_routine() {
		spin.version.setBoardVersion(SPIN_v_1_0);
		uint32_t com_task_number = task.createBackground(loop_communication_task);
		task.startBackground(com_task_number);
	}

	void loop_communication_task()
	{
		while (1) {
			received_serial_char = console_getchar();
			switch (received_serial_char) {
			case 's':
				state ^= 1;
				break;
			default:
				break;
			}
			k_msleep(100);
		}
	}

	void initTriangles() {
		for (uint8_t i = 0; i < numberOfTriangles; i++) {
			triangles[i] = (maxValue / numberOfTriangles) * i;
		}
	}

	int main() {
		setup_routine();
		initTriangles();
		while (1) {
			if (state) {
				for (uint8_t i = 0; i < numberOfTriangles - 1; i++) {
					printk("%d:", triangles[i]);
				}
				printk("%d\n", triangles[numberOfTriangles - 1]);
				for (uint8_t i = 0; i < numberOfTriangles; i++) {
					triangles[i] = triangles[i] + numberPoints;
				}
			}
			k_msleep(50);
		}
		return 0;
	}
	```
=== "Arduino"
	Here is the demo code. Tested on an Arduino Uno and Mega.
	``` arduino
	#define numberOfTriangles 3
	uint16_t maxValue = 256;
	uint8_t triangles[numberOfTriangles];
	uint8_t numberPoints = 4;
	int incomingByte;
	uint8_t state = 1;

	void setup() {
		Serial.begin(115200);
		initTriangles();
	}

	void initTriangles() {
	for (uint8_t i = 0; i < numberOfTriangles; i++) {
		triangles[i] = (maxValue / numberOfTriangles) * i;
		}
	}

	void loop() {
	incomingByte = Serial.read();
	if (incomingByte > 0) {
		if (incomingByte == 's') {
			state ^= 1;
		}
	}
	if (state) {
		for (uint8_t i = 0; i < numberOfTriangles - 1; i++) {
			Serial.print(triangles[i]);
			Serial.print(":");
		}
		Serial.println(triangles[numberOfTriangles - 1]);
		for (uint8_t i = 0; i < numberOfTriangles; i++) {
			triangles[i] = triangles[i] + numberPoints;
		}
	}
	delay(100);
	}
	```

## Result

![Glorious sawteeth](imgs/OwnPlot_demo_sawteeth.png)

In either case, you will get the same sawteeth in OwnPlot.
To open the port, please refer to [this page](first-steps.md).
