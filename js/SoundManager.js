define("SoundManager", [
	"jquery", 
	"underscore", 
	"backbone",
	"EventsManager"
], function ($, _, Backbone) {
	return {
		cache: {},

		sounds: {
			"bump": "sound/bump.wav",
			"smash": "sound/smash.wav",
			"coin": "sound/coin.wav",
			"gameover": "sound/gameover.wav",
			"warning": "sound/warning.wav",
			"oneup": "sound/oneup.wav",
			"powerup": "sound/powerup.wav",
			"powerdown": "sound/powerdown.wav",
			"win": "sound/win.wav",
			"fireball": "sound/fireball.wav"
		},

		playSound: function (name) {
			var sound = this.cache[name];	
			sound.play();
		},

		loadSound: function (name, path) {
			var defer = $.Deferred();
			var audio = new Audio(path);

			audio.addEventListener('canplaythrough', $.proxy(function () {
				this.cache[name] = audio;
				defer.resolve(audio);
			}, this));

			return defer;
		},


		loadSounds: function () {
			var arr = [];

			for (var sound in this.sounds) {
				if (!this.cache[sound]) {
					var path = this.sounds[sound];
					var loadSound = this.loadSound(sound, path);
					arr.push(loadSound);
				}
			}

			return $.when.apply(this, arr);
		}
	};
});