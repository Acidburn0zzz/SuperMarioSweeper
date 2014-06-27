define("World", [
	"jquery", 
	"underscore", 
	"backbone",
	"SoundManager",
	"EventsManager",
	"Blocks"
], function ($, _, Backbone, SoundManager, EventsManager, Blocks) {
	
	var World = Backbone.View.extend({
		dimensions: 0,
		difficulty: 0,
		
		collection: Blocks,

		events: {
			"click .block": "handleBlockClick"
		},

		/**
		 * Listen for new game events and set the world data when necessary
		 */
		initialize: function () {
			EventsManager.on("Window.Resize", $.proxy(this.adjustSizes, this));
			EventsManager.on("Game.NewGame", $.proxy(this.setWorld, this));
		},

		/**
		 * Set the world dimensions & difficulty and reset the collection
		 */
		setWorld: function (worldData) {
			this.dimensions = worldData.dimensions;
			this.difficulty = worldData.difficulty;
			this.reset();
		},

		/**
		 * Reveal all bowsers on the world
		 */
		revealBowsers: function () {
			var bowsers = this.collection.getAllBowsers();

			_.each(bowsers, function (block) {
				block.softReveal();
			});
		},

		/*
		 * Create the blocks collection and plant bowsers
		 */
		createBlocks: function () {
			var blocks = new Blocks({
				dimensions: this.dimensions,
				difficulty: this.difficulty
			});

			blocks.generateBlocks();
			blocks.plantBowserBlocks();
			blocks.countNearbyBowsers();

			return blocks;
		},

		/**
		 * React to blocks being clicked and reveal adjacent blocks
		 */
		handleBlockClick: function (evt) {
			var $el = $(evt.target);
			var block = this.collection.getById($el.attr("id"));

			if (block.get("isBowser")) {
				block.reveal();
				return;
			}

			this.collection.revealNearbyBlocks(block);
		},

		/**
		 * Render the collection of blocks into the world
		 */
		render: function () {
			var els = [];

			this.collection.each(function (block) {
				els.push(block.$el);
			});

			this.$el.html(els);
		},

		/**
		 * Empty the world and recreate the blocks
		 */
		reset: function () {
			this.$el.empty();

			var blocks = this.createBlocks();
			this.collection = blocks;
			this.render();
			this.adjustSizes();
		},

		adjustSizes: function () {
			var rowSize = this.dimensions;
			var containerWidth = this.$el.outerWidth(true);
			var rowWidthAndHeight = containerWidth / rowSize;

			this.collection.each(function (block) {
				// var $el = block.$el;
				// $el.css({
				// 	"lineHeight": rowWidthAndHeight + "px",
				// 	"height": rowWidthAndHeight,
				// 	"width": rowWidthAndHeight
				// });
			});
		}
	});
	
	return World;
});