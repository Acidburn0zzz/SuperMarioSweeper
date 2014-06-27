define("Blocks", [
	"jquery", 
	"underscore", 
	"backbone",
	"Block"
], function ($, _, Backbone, Block) {
	
	var Blocks = Backbone.Collection.extend({
		dimensions: 0,
		difficulty: 0,

		/**
		 * Setup the world dimensions & difficulty level
		 */
		initialize: function (settings) {
			this.dimensions = settings.dimensions;
			this.difficulty = settings.difficulty;

			return this;
		},

		/**
		 * Given a block, reveal all adjacent non-bowser blocks
		 */
		revealNearbyBlocks: function (block) {
			if (!block || block.get("isRevealed") || block.get("isBowser")) {
				return;
			}

			// Reveal the initial block
			block.reveal();

			if (block.get("dangerLevel") > 0) {
				return;
			}

			// get all adjacent non-bowser blocks
			var queue = [];
			queue.push(this.getAdjacentTopLeftBlock(block, false));
			queue.push(this.getAdjacentTopRightBlock(block, false));
			queue.push(this.getAdjacentLeftBlock(block, false));
			queue.push(this.getAdjacentRightBlock(block, false));
			queue.push(this.getAdjacentBottomLeftBlock(block, false));
			queue.push(this.getAdjacentBottomRightBlock(block, false));
			queue.push(this.getAdjacentBottomBlock(block, false));
			queue.push(this.getAdjacentTopBlock(block, false));
			
			queue = _.compact(queue);

			// reveal each adjacent block
			while(queue.length > 0) {
				var blockToReveal = queue.pop();
				this.revealNearbyBlocks(blockToReveal);
			}
		},

		/**
		 * Set the danger level (adjacent bowser count) for each block
		 */
		countNearbyBowsers: function () {
			var _this = this;

			this.each(function (block) {
				var dangerLevel = 0;

				if (!block.get("isBowser")) {
					dangerLevel = _this.dangerLevelForBlock(block);
				}

				block.set("dangerLevel", dangerLevel);
			});
		},

		/**
		 * Get the block to the top of the given block
		 */
		getAdjacentTopBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX(), block.getY() - 1, allowBowsers);
		},

		/**
		 * Get the block to the bottom of the given block
		 */
		getAdjacentBottomBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX(), block.getY() + 1, allowBowsers);
		},

		/**
		 * Get the block to the bottom left of the given block
		 */
		getAdjacentBottomLeftBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX() - 1, block.getY() + 1, allowBowsers);
		},

		/**
		 * Get the block to the bottom right of the given block
		 */
		getAdjacentBottomRightBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX() + 1, block.getY() + 1, allowBowsers);
		},

		/**
		 * Get the block to the right of the given block
		 */
		getAdjacentRightBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX() + 1, block.getY(), allowBowsers);
		},

		/**
		 * Get the block to the left of the given block
		 */
		getAdjacentLeftBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX() - 1, block.getY(), allowBowsers);
		},

		/**
		 * Get the block to the top left of the given block
		 */
		getAdjacentTopLeftBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX() - 1, block.getY() - 1, allowBowsers);
		},

		/**
		 * Get the block to the top right of the given block
		 */
		getAdjacentTopRightBlock: function (block, allowBowsers) {
			return this.getByPosition(block.getX() + 1, block.getY() - 1, allowBowsers);
		},

		/** 
		 * Count up the adjacent bowser blocks
		 */
		dangerLevelForBlock: function (block) {
			var results = [];

			results.push(this.getAdjacentLeftBlock(block, true));
			results.push(this.getAdjacentRightBlock(block, true));
			results.push(this.getAdjacentTopBlock(block, true));
			results.push(this.getAdjacentBottomBlock(block, true));

			results.push(this.getAdjacentTopLeftBlock(block, true));
			results.push(this.getAdjacentTopRightBlock(block, true));
			results.push(this.getAdjacentBottomLeftBlock(block, true));
			results.push(this.getAdjacentBottomRightBlock(block, true));

			return _.compact(results).length;
		},

		/**
		 * Return a block based on random x/y coordinates
		 */
		getRandomBlock: function () {
			var randomX = Math.floor((Math.random() * this.dimensions - 1) + 1);
			var randomY = Math.floor((Math.random() * this.dimensions - 1) + 1);

			return this.getByPosition(randomX, randomY);
		},

		/**
		 * Return every bowser block
		 */
		getAllBowsers: function () {
			return this.where({
				isBowser: true
			});
		},

		/**
		 * Get a block by x y coordinates, optionally filter out bowsers
		 */
		getByPosition: function (x, y, isBowser) {
			var params = {
				x: x,
				y: y
			};

			if (!_.isUndefined(isBowser)) {
				params.isBowser = isBowser;
			}

			return this.findWhere(params);
		},

		/**
		 * Return a block by the unique generated id
		 */
		getById: function (id) {
			return this.findWhere({
				id: id
			});
		},

		/**
		 * Generate blocks based on given dimensions for world
		 */
		generateBlocks: function () {
			var blocks = [];

			for (var y = 0; y < this.dimensions; y++) {
				for (var x = 0; x < this.dimensions; x++) {
					blocks.push(new Block({
						id: _.uniqueId("block-"),
						x: x,
						y: y
					}));
				}
			}

			this.reset(blocks);
		},

		/**
		 * Plant given # of bowsers based on difficulty randomly
		 */
		plantBowserBlocks: function () {
			var numBowsersToPlace = this.difficulty;
			var numBowsersPlaced = 0;

			while(numBowsersPlaced < numBowsersToPlace) {
				var block = this.getRandomBlock();

				if (!block.get("isBowser")) {
					block.set("isBowser", true);
				}

				numBowsersPlaced++;
			}
		}
	});
	
	return Blocks;
});