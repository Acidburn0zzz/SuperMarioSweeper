define("Config", function () {

	return {
		/**
	 	 * Rate at which the game timer ticks
	 	 */
		"TICK_RATE": 1000,

		/**
	 	 * Chance to get a one-up
	 	 */
		"ONE_UP_CHANCE": .05,

	 	/**
	 	 * Chance to receive a flower power up
	 	 */
	 	"FLOWER_CHANCE": .05,

	 	 /**
	 	 * Chance to get a power-up
	 	 */
	 	"POWER_UP_CHANCE": .1,

		/**
		 * Max amount of time allowed to win before game is over
		 */
		"MAX_TIME": 99 * 1000,

		/**
		 * Threshold time for playing the low time warning sound
		 */
		"LOW_TIME_THRESHOLD": 10 * 1000,

		/**
		 * Default score for revealing a block
		 */
		"SCORE_FOR_BLOCK": 10,

		/**
		 * Level definitions
		 */
		"WORLDS": {
			'1-1': {
				'dimensions': 8,
				'difficulty': 10
			},
			'1-2': {
				'dimensions': 10,
				'difficulty': 12
			}
		}
	};
});