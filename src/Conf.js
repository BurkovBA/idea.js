(function(){
    Idea.Conf = {
    	canvasMinX: -1000, // this is leftmost coordinate where grid pattern starts to be drawn (in canvas coordinates)
        canvasMaxX: 1000, // this is rightmost coordinate where grid pattern ends to be drawn (in canvas coordinates)
        canvasMinY: -1000, // this is the bottommost coordinate where grid pattern starts to be drawn (in canvas coordinates)
        canvasMaxY: 1000, // this is the topmost coordinate where grid pattern ends to be drawn (in canvas coordinates)        

        defaultViewboxWidth: 800, // this is in canvas coordinates
        defaultViewboxHeight: 800, // this is in canvas coordinates
        defaultViewportWidth: 800, // this is in browser window coordinates
        defaultViewportHeight: 800, // this is in browser window coordinates

        objectIconWidth: 40, // this is the size of miniature
        objectIconHeight: 40, // this is the size of miniature

    	scrollbarScrollsPerPage: 20, // how many lines per page are there in vertical scrollbar or how many chars per line in horizontal scrollbar
        minimalSliderSize: 50, // the least amount of pixels a scrollbar's slider can take
        scrollbarOtherSide: 30, // scrollbar has to sides: long and short; this is the length of the short side

        framerate: 25
    };
})();
