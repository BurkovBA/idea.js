(function(){
    Idea.Conf = {
    	canvasWidth: 2000, // this determines the size of coordinates grid (in canvas coordinates)
    	canvasHeight: 2000, // this determines the size of coordinates grid (in canvas coordinates)
    	canvasLeft: -1000, // this is where coordinates grid pattern starts to be drawn (in canvas coordinates)
    	canvasTop: -1000, // this is where coordinates grid pattern starts to be drawn (in canvas coordinates)

        defaultViewboxWidth: 4096, // this is in canvas coordinates
        defaultViewboxHeight: 4096, // this is in canvas coordinates
        defaultViewportWidth: 800, // this is in browser window coordinates
        defaultViewportHeight: 800, // this is in browser window coordinates

    	scrollbarScrollsPerPage: 20, // how many lines per page are there in vertical scrollbar or how many chars per line in horizontal scrollbar

        framerate: 25
    };
})();
