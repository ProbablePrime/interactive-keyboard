'use strict';
const telnet = require('telnet-client');
const RingBuffer = require('ringbuf');

const geofix = {
	params: {
		host: '',
		port: 0
	},
	setup(config) {
		this.params = config.telnet;
		this.ring = new RingBuffer(5);
		this.start = config.start;
		this.telnet = new telnet();
		this.current = config.start;
		return this.telnet.connect(this.params).then(this.reset.bind(this), err => {
			console.log(err);
		});
	},
	geoFix(obj) {
		const lat = obj.lat;
		const long = obj.long;
		console.log(`going to ${lat} ${long}`);
		return this.telnet.exec(`geo fix ${lat} ${long}`).then(res => {
			if (res.search('OK') !== -1) {
				console.log('done');
				this.current.lat = lat;
				this.current.long = long;
			} else {
				throw new Error("NOPE");
			}
		});
	},
	reset() {
		return this.geoFix({lat:this.start.lat, long:this.start.long});
	},
	apply(joyStickState) {
		const mean = joyStickState.coordMean;
		if (isNaN(mean.x) || isNaN(mean.y)) {
			return;
		}
		const size = this.ring.size();
		//XXX: y is inverted because of how geospatials work I guess. Meh who cares
		this.ring.enq({
			lat: this.scale('lat', mean.x), long: this.scale('long', mean.y * -1)
		});
		if (size === 0) {
			this.process();
		}
	},
	scale(key, value) {
		// Add another 0 for crawling, remove another one for bicyle
		const scaleFactor = 100000;
		return this.current[key] + value / scaleFactor;
	},
	process() {
		
		if (!this.ring.isEmpty()) {
			this.geoFix(this.ring.deq()).finally(this.process.bind(this));
		}
	}
};

module.exports = geofix;
