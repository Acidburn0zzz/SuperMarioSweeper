define("Scoreboard", [
	"jquery", 
	"underscore", 
	"backbone",
	"Config",
	"SoundManager",
	"EventsManager"
], function ($, _, Backbone, Config, SoundManager, EventsManager) {
	
	var Scoreboard = Backbone.View.extend({

		/**
		 * Track the time remaining in the game
		 */
		gameTimeRemaining: Config.MAX_TIME,

		/**
		 * Interval for the game ticks
		 */
		gameTimer: null,

		/**
		 * Timer for the final tally score screen
		 */
		tallyTimer: null,

		/**
		 * Players current score
		 */
		currentScore: 0,

		/**
		 * Cache some jQuery elements
		 */
		$score: null,
		$coin: null,
		$flag: null,
		$timer: null,

		/**
		 * Listen for new games and detach the spinning coin element
		 */
		initialize: function () {
			this.$timer = this.$(".js-time");
			this.$flag = $("#flag");
			this.$score = this.$(".js-score");
			this.$coin = this.$(".coin").detach();
		},

		/**
		 * Set current score to 0 and render it
		 */
		reset: function () {
			this.currentScore = 0;
			this.gameTimeRemaining = Config.MAX_TIME;
			this.stopAllTimers();
			this.renderTime();
			this.renderScore();
			this.$flag.removeClass("raising");
		},

		addTimeToScore: function () {
			this.gameTimer = setInterval($.proxy(function () {
				if (this.gameTimeRemaining === 0) {
					this.stopAllTimers();
					return;
				}

				this.gameTimeRemaining -= Config.TICK_RATE;
				this.currentScore++;

				this.renderTime();
				this.renderScore();
			}, this), 50);
		},

		tallyFinalScore: function () {
			this.tallyTimer = setTimeout($.proxy(function () {
				SoundManager.playSound("flagpole");
				this.$flag.addClass("raising");
				this.addTimeToScore();
			}, this), 1000);
		},

		/**
		 * Handle time changes, updating the time text, warn / game over if necessary
		 */
		handleGameTick: function () {
			this.gameTimeRemaining -= Config.TICK_RATE;
			this.renderTime();

			if (this.gameTimeRemaining === Config.LOW_TIME_THRESHOLD) {
				this.lowTimeWarning();
			}

			if (this.gameTimeRemaining <= 0) {
				this.stopTimer();
				EventsManager.trigger("Scoreboard.TimeUp");
				return;
			}
		},

		/**
		 * Play a sound to inform the player that they are running out of time
		 */
		lowTimeWarning: function () {
			SoundManager.playSound("warning");
		},

		/**
		 * Start the level timer
		 */
		startTimer: function () {
			this.stopAllTimers();
			this.gameTimeRemaining = Config.MAX_TIME;
			this.renderTime();
			this.gameTimer = setInterval($.proxy(this.handleGameTick, this), Config.TICK_RATE);
		},

		/**
		 * Render the timer element text
		 */
		renderTime: function () {
			this.$timer.text(this.gameTimeRemaining / Config.TICK_RATE);
		},

		/**
		 * Clear the tick timer
		 */
		stopAllTimers: function () {
			clearInterval(this.tallyTimer);
			clearInterval(this.gameTimer);
		},

		/**
		 * Render current score into the text
		 */
		renderScore: function () {
			this.$score.text(this.currentScore);
		},

		/**
		 * Add newScore onto the current score and animate the coin
		 */
		updateScore: function (newScore) {
			if (!newScore) {
				newScore = 1;
			}

			this.currentScore += newScore;

			this.renderScore();
			this.animateCoin();

			this.$score.text(this.currentScore);
		},

		/**
		 * Animate the coin and play a cool sound
		 */
		animateCoin: function () {
			this.$(".coin").remove();
			this.$el.prepend(this.$coin.clone(true).addClass("fadeOutUp"));
			SoundManager.playSound("coin");
		}
	});
	
	return Scoreboard;
});