'use strict';

const  scroll = (function() {
    const vars = {
        allow: true,
        datasetScroll: false,
        doc: document.documentElement,
        interval: 0,
        firstCompleted: false,
        midlleMax: 0,
        pageHeight: 0,
        pixelScrolled: 0,
        positionTop: 0,
        rest: 0,
        stepMax: {},
        step: 0,
        stepLeap: 0,
        timeStart: null,
        totalScroll: 0,
        viewHeight: 0
    };

    function defineMaxStep(size) {
        let 
            step = 0,
            pixels = 0;
        while(true) {
            if(pixels < size) {
                step += 2;
                pixels += step;
            } else {
                break;
            }
        }
        return {step: step, size: pixels};
    }

    function allowedScroll() {
        vars.positionTop = window.pageYOffset;

        if(((vars.step > 0) && ((vars.positionTop + vars.viewHeight) < vars.pageHeight)) || 
            ((vars.step < 0) && (vars.positionTop > 0))) {
            return true;
        }

        return false;
    }

    function redefine() {
        vars.allow = true;
        vars.firstCompleted = false;
        vars.pixelScrolled = 0;
        vars.stepMax = {};
        vars.step = 0;
        vars.stepLeap = 0;
        vars.rest = 0;
        vars.timeStart = null;
    }

    function beginScroll() {
        if(!vars.firstCompleted && allowedScroll() ) {
            vars.doc.scrollTop += vars.step;
            vars.stepLeap +=2;
            vars.pixelScrolled += vars.stepLeap;

            if(vars.stepLeap < vars.stepMax.step) {
                if(vars.step > 0) {
                    vars.step += 2;
                }
                else {
                    vars.step -= 2;
                }
            } else {
                vars.firstCompleted = true;
            }
        } else if((vars.pixelScrolled + vars.stepLeap) <= vars.midlleMax && allowedScroll() ) {
            vars.doc.scrollTop += vars.step;
            vars.pixelScrolled += vars.stepLeap;

            if((vars.pixelScrolled + vars.stepLeap) > vars.midlleMax) {
                vars.rest = vars.totalScroll - (vars.pixelScrolled + vars.stepMax.size);
                if((vars.rest % 2) !== 0) {
                    vars.rest -= 1;
                }
            }
        } else if((vars.pixelScrolled + vars.stepLeap) <= vars.totalScroll && allowedScroll() ) {
            vars.doc.scrollTop += vars.step;
            vars.pixelScrolled += vars.stepLeap;

            if(vars.rest !== vars.stepLeap) {
                if(vars.step > 2) {
                    vars.stepLeap -= 2;
                    vars.step -= 2;
                } else if(vars.step < -2) {
                    vars.stepLeap -= 2;
                    vars.step += 2;
                }
            } else {
                vars.rest += 1;
            }
        } else {
            if(vars.pixelScrolled < vars.totalScroll) {
                if(vars.step > 0) {
                    vars.doc.scrollTop += 1;
                }
                else {
                    vars.doc.scrollTop -= 1;
                }
            }

            clearInterval(vars.timeStart);
            redefine();
        }
    }

    function dataSetElement(ev) {
        if(!ev) {
            ev = window.event;
        }
        let dataset = ev.target.dataset.scroll || 'no';

        if(dataset.toLowerCase() === 'yes') {
            vars.datasetScroll = true;
        } else {
            vars.datasetScroll = false;
        }
    }
    vars.doc.addEventListener('mouseover', dataSetElement);

    return function(obj) {
        vars.interval = obj.interval || 16;
        vars.viewHeight = vars.doc.clientHeight;
        vars.totalScroll = Math.round(vars.viewHeight * (obj.viewSize || 1));
        vars.stepMax = defineMaxStep(Math.round(vars.totalScroll / 3.4));
        vars.midlleMax = vars.totalScroll - vars.stepMax.size;
        vars.pageHeight = document.body.clientHeight;

        function startScroll() {
            if(vars.allow) {
                vars.allow = false;

                if(obj.direction.toLowerCase() === 'ahead') {
                    vars.step = 2;
                    vars.timeStart = setInterval(beginScroll, vars.interval);
                } else if(obj.direction.toLowerCase() === 'back') {
                    vars.step = -2;
                    vars.timeStart = setInterval(beginScroll, vars.interval);
                }
            }
        }

        if(!vars.datasetScroll) {
            startScroll();
        }
    };
})();
