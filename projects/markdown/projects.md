# Projects

Here are the things I've worked on!

---

> THIS PAGE IS CURRENTLY IN PROGRESS

If you prefer pdfs you can check out my formal [Samples of Work](/resume.pdf) document.

## Smart Sustainability Bat Box

```carousel
![Image of smart bat box with view of components](/assets/images/batbox.jpeg "Smart bat box")
![Image of lighting center from the bottom of the bat box](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/508/621/datas/gallery.jpg "Bat box lighting sensor and bottom view")
![Image of bat box internals](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/508/622/datas/gallery.jpg "View of the Arduino, batter, and 3 of the sensors")
![Another image of the bat box internals](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/508/623/datas/gallery.jpg "Another angle of the sensors")
![Image of the outside of the bat box](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/509/264/datas/gallery.jpg "The outside of the bat box")
```

- Built a sensor-equipped bat box with on-device computer vision to detect bats on an Arduino UNO Q (∼100fps)
- Fine-tuned BatNet model in PyTorch on 10,000+ daylight photos, cutting false alarms from 42% to 13% at 70% recall
- Streamed sensor data over Wi-Fi to Firebase and built a website pulling it into a dashboard with maintenance advice

## Bluetooth Antenna

![Image of bluetooth atnenna in hfss](/assets/images/bluetooth-antenna.png "Bluetooth antenna with it's radiation pattern")

- Designed, simulated, and optimized a meandered inverted-F antenna in HFSS for 2.4 GHz BLE, reaching 90%
efficiency and 100 MHz bandwidth to transmit plant moisture sensor data

## Synth Synthesis

```carousel
![Image of Synth Synthesis running on hardware](/assets/images/synth-synthesis-on-hardware.jpg "Starting screen and running on FPGA plus hardware")
![Image of Synth Synthesis wave selection screen](/assets/images/synth-synthesis.png "Synth Synthesis wave selection screen")
![Image of interactive wave modulation saw wave](/assets/images/synth-synthesis-saw.png "Interactive wave modulation screen with saw wave")
![Image of saw wave modulated](/assets/images/synth-synthesis-saw-modulated.png "The saw wave with the frequency, phase, and amplitude modulated")
![Image of square wave](/assets/images/synth-synthesis-square.png "A square wave")
![Image of sine wave](/assets/images/synth-synthesis-sine.png "The sine wave")
```

- Spearheaded the development of a microprocessor based synthesizer using Verilog and our own assembly language
- Constructed the microprocessor’s instruction set using a datapath and state-machine to run code from memory
- Built blocking and non-blocking drivers for several devices, and the logic to control and display modulated waveforms


## 360° RF Test Analyzer

![Image of Test Analyzer with polar plot at 2.300625GHz of frequency](/assets/images/rf-test-analyzer.png "Analyzer producing polar plot at a frequency of 2.300625GHz")

- Automated processing of 360◦ anechoic chamber VNA data in Python, organized by frequency and angle
- Built a GUI generating polar plots at each of 1601+ measured frequencies to inform engineering decisions
