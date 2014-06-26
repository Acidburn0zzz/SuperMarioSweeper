require(["underscore", "Game", "EventsManager"], function(_, Game, EventsManager) {
	$(window).on("resize", _.throttle(function () {
		EventsManager.trigger("Window.Resize");
	}, 250));

	var game = new Game({
		el: $("#game")
	});
});