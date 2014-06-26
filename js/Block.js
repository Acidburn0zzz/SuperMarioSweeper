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

		reveal: function () {
			EventsManager.trigger("Block.Revealed", this);
		},

		render: function () {
			this.$el = $(blockTemplate(this.toJSON()));
		}
	});
	
	return Block;
});