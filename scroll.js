'use strict';

function scroll(interval, size = 1) {
    let 
        allow = true, controlStep = 1, currentPosition = 0, oneFourth = 0, pageHeight = 0, 
        pixels = 1, pixelsScrolled = 0, reverse = true, scrollSize = 0, startTime = null,
        step = 0, stepLeap = 1, threeFourth = 0, viewHeight = 0;

    function preventScrool(ev) {
        if(ev.preventDefault) {
            ev.preventDefault();
        }
        ev.returnValue = false;
    }

    function smothStart() {
        document.documentElement.scrollTop += step;
        if(controlStep === pixels) {
            if(step > 0) {
                step++;
            } else {
                step--;
            }
            stepLeap++;
            controlStep += (stepLeap * stepLeap);
        }
        pixels += stepLeap;
    }

    function smothEnd() {
        document.documentElement.scrollTop += step;
        if(reverse) {
            controlStep = controlStep -  (stepLeap * stepLeap);
            pixels -= stepLeap;
            reverse = false;
        }
        if(controlStep === pixels) {
            if(step > 1) {
                step--;
            } else if(step < -1) {
                step++;
            }
            stepLeap--;
            controlStep -= stepLeap * stepLeap;
        }
        pixels -= stepLeap;
    }

    function smothStop() {
        let diffScroll = pixelsScrolled - scrollSize;
        let localStep = 0;
        if(step < 0) {
            localStep -= step; 
        } else {
            localStep = step;
        }
        if((diffScroll > 0) && (diffScroll < localStep)) {
            if(step > 0) {
                document.documentElement.scrollTop += (localStep - diffScroll);
            } else {
                document.documentElement.scrollTop += (step + diffScroll);
            }
        }
        endStop();
    }

    function endStop() {
        allow = true;
        clearInterval(startTime);
        controlStep = 1;
        pixelsScrolled = 0;
        pixels = 1;
        reverse = true;
        stepLeap = 1;
    }

    function allowedScroll() {
        currentPosition = window.pageYOffset;
        if(((step > 0) && ((currentPosition + viewHeight) < pageHeight)) || 
            ((step < 0) && (currentPosition > 0))) {
            return true;
        }
            
        return false;
    }

    function movePage() {
        if(step > 0) {
            pixelsScrolled += step;
        } else {
            pixelsScrolled -= step;
        }
        if(pixelsScrolled < oneFourth) {
            if( allowedScroll() ) {
                smothStart();
            } else {
                endStop();
            }
        }else if(pixelsScrolled >= threeFourth && pixelsScrolled <= scrollSize) {
            if( allowedScroll() ) {
                smothEnd();
            } else {
                endStop();
            }
        } else if(pixelsScrolled > scrollSize) {
            smothStop();
        } else {
            if( allowedScroll() ) {
                document.documentElement.scrollTop += step;
            } else {
                endStop();
            }
        }
    }

    function controlScroll(ahead) {
        currentPosition = window.pageYOffset;
        if(ahead && ((currentPosition + viewHeight) < pageHeight)) {
            step = 1;
            startTime = setInterval(movePage, interval || 7);
        } else if(!ahead && (currentPosition > 0)){
            step = -1;
            startTime = setInterval(movePage, interval || 7);
        } else {
            allow = true;
        }
    }

    function startMouse(ev) {
        if(!ev) {
            e = window.event;
        }
        preventScrool(ev);
        if(allow) {
            allow = false;
            if(ev.deltaY > 0) {
                controlScroll(true);
            } else if(ev.deltaY < 0) {
                controlScroll(false);
            }
        }
    }

    function startKey(ev) {
        if(!ev) {
            e = window.event;
        }
        preventScrool(ev);
        if(allow) {
            if((ev.keyCode === 32) || (ev.keyCode === 34) || (ev.keyCode === 40)) {
                allow = false;
                controlScroll(true);
            } else if((ev.keyCode === 33) || (ev.keyCode === 38)) {
                allow = false;
                controlScroll(false);
            }
        }
    }

    function startScroll() {
        if(document.readyState === 'loading') {
            setTimeout(startScroll, 250);
        } else {
            viewHeight = document.documentElement.clientHeight;
            scrollSize = Math.round(viewHeight * size);
            oneFourth = Math.round(scrollSize / 4);
            threeFourth = Math.round(oneFourth * 3);
            pageHeight = document.body.clientHeight;
            document.addEventListener('wheel', startMouse, {passive: false});
            document.addEventListener('keydown', startKey);
        }
    }
    
    setTimeout(startScroll, 250);
}
