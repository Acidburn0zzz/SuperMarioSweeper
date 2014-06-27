define("Block", [
	"jquery", 
	"underscore", 
	"backbone",
	"EventsManager",
	"SoundManager"
], function ($, _, Backbone, EventsManager, SoundManager) {
	
	//	cache the block template function
	var blockTemplate = _.template($("#tpl-block").html());

	var Block = Backbone.Model.extend({
		defaults: {
			x: 0,
			y: 0,
			isRevealed: false,
			isBowser: false,
			dangerLevel: 0
		},

		getX: function () {
			return this.get("x");
		},

		getY: function () {
			return this.get("y");
		},
		
		initialize: function () {
			this.render();
		},

		softReveal: function () {
			var classNames = "is-revealed";

			if (this.get("isBowser")) {
				classNames += " is-bowser";
			}

			this.$el.addClass(classNames);
		},

		reveal: function () {
			if (this.get("revealed")) {
				return false;
			}

			this.softReveal();
			
			var dangerLevel = this.get("dangerLevel");

			if (dangerLevel > 0) {
				this.$el.text(dangerLevel);
			}

			EventsManager.trigger("Block.Revealed", this, this.$el);
		},

		render: function () {
			this.$el = $(blockTemplate(this.toJSON()));
		}
	});
	
	return Block;
});