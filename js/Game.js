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
			"click .js-restart": "restartLevel",
			"change .js-change-level": "changeLevel"
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

		currentTurn: 0,

		/**
		 * Store the active world configuration
		 */
		currentLevel: {},

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

			// Load sounds and boot up the game
			SoundManager.loadSounds().then($.proxy(function () {
				this.$timer = this.$(".js-time");

				this.world = new World({
					el: $("#world")
				});

				this.scoreboard = new Scoreboard({
					el: $("#scoreboard")
				});

				this.startNewGame(Config.LEVELS["1-1"]);
			}, this));
		},

		startNewGame: function (level) {
			this.currentLevel = level;
			EventsManager.trigger("Game.NewGame", level, this);
			this.reset();
		},

		/**
		 * Stop the game!
		 */
		stopGame: function () {
			this.isOver = true;
			this.world.revealBowsers();
			this.stopTimer();
		},

		/**
		 * Reset all values to their defaults
		 */
		reset: function () {
			var numBlocks = this.currentLevel.dimensions * this.currentLevel.dimensions;
			var revealsNeededForWin = numBlocks - this.currentLevel.difficulty;

			this.numBlocks = numBlocks;
			this.numRevealed = 0;
			this.currentTurn = 0;
			this.isOver = false;
			this.winCondition = revealsNeededForWin;
		},


		restartLevel: function () {
			this.startNewGame(this.currentLevel);
		},

		/**
		 * Start the level timer
		 */
		startTimer: function () {
			this.stopTimer();
			this.timeRemaining = Config.MAX_TIME;
			this.renderTimerText();
			this.timer = setInterval($.proxy(this.handleGameTick, this), Config.TICK_RATE);
		},

		/**
		 * Clear the tick timer
		 */
		stopTimer: function () {
			clearInterval(this.timer);
		},

		/**
		 * Handle time changes, updating the time text, warn / game over if necessary
		 */
		handleGameTick: function () {
			this.timeRemaining -= Config.TICK_RATE;
			this.renderTimerText();

			if (this.timeRemaining === Config.LOW_TIME_THRESHOLD) {
				this.lowTimeWarning();
			}

			if (this.timeRemaining <= 0) {
				this.stopTimer();
				this.gameOver();
				return;
			}
		},

		renderTimerText: function () {
			this.$timer.text(this.timeRemaining / Config.TICK_RATE);
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
		handleBlockReveal: function (block, $el) {
			if (this.isOver || block.get("isRevealed")) {
				return false;
			}

			// start the timer on the players first turn
			if (this.currentTurn <= 0) {
				this.startTimer();
			}

			console.log(this.winCondition);
			this.currentTurn++;
			this.numRevealed++;

			// uh oh, game over!
			if (block.get("isBowser")) {
				this.gameOver();
				return;
			}
			
			SoundManager.playSound("bump");

			// check if user is a winner
			if (this.numRevealed == this.winCondition) {
				this.gameWinner();
			}

			block.set("isRevealed", true);
			this.scoreboard.updateScore(Config.SCORE_FOR_BLOCK);
		},

		/**
		 * Start a new game when the world changes
		 */
		changeLevel: function (evt) {
			var $el = $(evt.target);
			var value = $el.val();

			this.startNewGame(Config.LEVELS[value]);
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
		}
	});
	
	return Game;
});