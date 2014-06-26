define("Scoreboard", [
	"jquery", 
	"underscore", 
	"backbone",
	"Config",
	"SoundManager",
	"EventsManager"
], function ($, _, Backbone, Config, SoundManager, EventsManager) {
	
	var Scoreboard = Backbone.View.extend({
		currentScore: 0,
		coin: null,

		/**
		 * Listen for new games and detach the spinning coin element
		 */
		initialize: function () {
			EventsManager.on("Game.NewGame", $.proxy(this.handleNewGame, this));
			this.coin = this.$(".coin").detach();
		},

		/**
		 * Reset the score
		 */
		handleNewGame: function () {
			this.reset();
		},

		/**
		 * Set current score to 0 and render it
		 */
		reset: function () {
			this.currentScore = 0;
			this.renderScore();
		},

		/**
		 * Render current score into the text
		 */
		renderScore: function () {
			this.$(".js-score").text(this.currentScore);
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

			this.$(".js-score").text(this.currentScore);
		},

		/**
		 * Animate the coin and play a cool sound
		 */
		animateCoin: function () {
			this.$(".coin").remove();
			this.$el.prepend(this.coin.clone(true).addClass("fadeOutUp"));
			SoundManager.playSound("coin");
		}
	});
	
	return Scoreboard;
});