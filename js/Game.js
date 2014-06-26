define("Game", [
	"jquery", 
	"underscore", 
	"backbone",
	"Config",
	"SoundManager",
	"EventsManager",
	"World",
	"Scoreboard"
], function ($, _, Backbone, Config, SoundManager, EventsManager, World, Scoreboard) {

	/**
	 * The game object manages time, win conditions, and changing / rendering the level
	 */
	var Game = Backbone.View.extend({
		events: {
			"change .js-world-select": "handleWorldChange"
		},

		/**
		 * Track the time remaining in the game
		 */
		timeRemaining: Config.MAX_TIME,

		/**
		 * Is the game over or not
		 */
		isOver: false,

		/**
		 * Current world object
		 */
		world: null,

		/**
		 * Store the active world configuration
		 */
		activeWorld: {},

		/**
		 * Number of blocks total
		 */
		numBlocks: 0,

		/**
		 * Number of blocks player has revealed so far
		 */
		numRevealed: 0,

		/**
		 * Number of blocks needed to win the game
		 */
		winCondition: 0,

		/**
		 * Timer for the game ticks
		 */
		timer: null,

		/**
		 * First load all sounds and then call ready
		 */
		initialize: function () {
			EventsManager.on("Block.Revealed", $.proxy(this.handleBlockReveal, this));

			SoundManager.loadSounds().then($.proxy(function () {
				this.world = new World({
					el: $("#world")
				});

				this.scoreboard = new Scoreboard({
					el: $("#scoreboard")
				});

				this.startNewGame(Config.WORLDS["1-1"]);
			}, this));
		},

		startNewGame: function (world) {
			this.activeWorld = world;
			EventsManager.trigger("Game.NewGame", world, this);
			this.reset();
		},

		/**
		 * Clear the tick timer
		 */
		stopTimer: function () {
			clearInterval(this.timer);
		},

		/**
		 * Start the level timer
		 */
		startTimer: function () {
			this.stopTimer();
			this.timer = setInterval($.proxy(this.handleGameTick, this), Config.TICK_RATE);
		},

		/**
		 * Handle time changes, updating the time text, warn / game over if necessary
		 */
		handleGameTick: function () {
			this.$(".js-time").text(this.timeRemaining / Config.TICK_RATE);

			if (this.timeRemaining == Config.LOW_TIME_THRESHOLD) {
				this.lowTimeWarning();
			}

			if (this.timeRemaining <= 0) {
				this.stopTimer();
				this.gameOver();
				return;
			}

			this.timeRemaining -= Config.TICK_RATE;
		},

		/**
		 * Play a sound to inform the player that they are running out of time
		 */
		lowTimeWarning: function () {
			SoundManager.playSound("warning");
		},

		/**
		 * Handle clicks on individual blocks
		 */
		handleBlockReveal: function (block) {
			if (this.isOver || block.get("isRevealed")) {
				return false;
			}

			var $el = block.$el;

			this.numRevealed++;

			$el.addClass("is-revealed");
			block.set("isRevealed", true);

			// uh oh, game over!
			if (block.get("isBowser")) {
				$el.addClass("is-bowser");
				this.gameOver();
				return;
			}

			if (block.get("dangerLevel") > 0) {
				$el.text(block.get("dangerLevel"));
			}

			this.scoreboard.updateScore(Config.SCORE_FOR_BLOCK);
			SoundManager.playSound("bump");

			// check if user is a winner
			if (this.numRevealed == this.winCondition) {
				this.gameWinner();
			}
		},

		/**
		 * Start a new game when the world changes
		 */
		handleWorldChange: function (evt) {
			var $el = $(evt.target);
			var value = $el.val();

			this.startNewGame(Config.WORLDS[value]);
		},

		/**
		 * Reset all values to their defaults
		 */
		reset: function () {
			this.timeRemaining = Config.MAX_TIME;
			this.numBlocks = this.activeWorld.dimensions * this.activeWorld.dimensions;
			this.numRevealed = 0;
			this.winCondition = this.numBlocks - this.activeWorld.difficulty;
			this.isOver = false;
			this.startTimer();
		},

		/**
		 * Mark the game as over and reveal all bowsers
		 */
		gameOver: function () {
			this.stopGame();
			SoundManager.playSound("gameover");
		},

		/**
		 * A winner is you!
		 */
		gameWinner: function () {
			this.stopGame();
			SoundManager.playSound("win");
		},

		/**
		 * Stop the game!
		 */
		stopGame: function () {
			this.isOver = true;
			this.world.revealBowsers();
			this.stopTimer();
		}
	});
	
	return Game;
});