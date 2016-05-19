angular.module('me-lazyload', [])
.directive('lazySrc', ['$window', '$document', function($window, $document){
    var doc = $document[0],
        body = doc.body,
        win = $window,
        $win = angular.element(win),
        uid = 0,
        elements = {};

    function getUid(el){
        var __uid = el.data("__uid");
        if (! __uid) {
            el.data("__uid", (__uid = '' + ++uid));
        }
        return __uid;
    }

    function getWindowOffset(){
        var t,
            pageXOffset = (typeof win.pageXOffset == 'number') ? win.pageXOffset : (((t = doc.documentElement) || (t = body.parentNode)) && typeof t.ScrollLeft == 'number' ? t : body).ScrollLeft,
            pageYOffset = (typeof win.pageYOffset == 'number') ? win.pageYOffset : (((t = doc.documentElement) || (t = body.parentNode)) && typeof t.ScrollTop == 'number' ? t : body).ScrollTop;
        return {
            offsetX: pageXOffset,
            offsetY: pageYOffset
        };
    }

    function isVisible(iElement){
        var elem = iElement[0],
            elemRect = elem.getBoundingClientRect(),
            windowOffset = getWindowOffset(),
            winOffsetX = windowOffset.offsetX,
            winOffsetY = windowOffset.offsetY,
            elemWidth = elemRect.width,
            elemHeight = elemRect.height,
            elemOffsetX = elemRect.left + winOffsetX,
            elemOffsetY = elemRect.top + winOffsetY,
            viewWidth = Math.max(doc.documentElement.clientWidth, win.innerWidth || 0),
            viewHeight = Math.max(doc.documentElement.clientHeight, win.innerHeight || 0),
            xVisible,
            yVisible;

        if(elemOffsetY <= winOffsetY){
            if(elemOffsetY + elemHeight >= winOffsetY){
                yVisible = true;
            }
        }else if(elemOffsetY >= winOffsetY){
            if(elemOffsetY <= winOffsetY + viewHeight){
                yVisible = true;
            }
        }

        if(elemOffsetX <= winOffsetX){
            if(elemOffsetX + elemWidth >= winOffsetX){
                xVisible = true;
            }
        }else if(elemOffsetX >= winOffsetX){
            if(elemOffsetX <= winOffsetX + viewWidth){
                xVisible = true;
            }
        }

        return xVisible && yVisible;
    };

    function checkImage(){
        Object.keys(elements).forEach(function(key){
            var obj = elements[key],
                iElement = obj.iElement,
                $scope = obj.$scope;
            if(isVisible(iElement)){
                iElement.attr('src', $scope.lazySrc);
            }
        });
    }

    //$win.bind('scroll', checkImage);
    $win.bind('resize', checkImage);

    function onLoad(){
        var $el = angular.element(this),
            uid = getUid($el);

        $el.css('opacity', 1);

        if(elements.hasOwnProperty(uid)){
            delete elements[uid];
        }
    }

    return {
        restrict: 'A',
        scope: {
            scrollContainer:'@',
            lazySrc: '@',
            animateVisible: '@',
            animateSpeed: '@'
        },
        link: function($scope, iElement){

            iElement.bind('load', onLoad);

            var $scrollContainer = $win
            $scrollContainer.on('scroll', checkImage);


            $scope.$watch('scrollContainer', function(newVal){
                if(newVal){
                    $scrollContainer.off('scroll', checkImage);
                    $scrollContainer = angular.element(document).find($scope.scrollContainer);
                    $scrollContainer.on('scroll', checkImage);
                }
            });


            $scope.$watch('lazySrc', function(){
                var speed = "1s";
                if ($scope.animateSpeed != null) {
                    speed = $scope.animateSpeed;
                }
                if(isVisible(iElement)){
                    if ($scope.animateVisible) {
                        iElement.css({
                            'background-color': '#fff',
                            'opacity': 0,
                            '-webkit-transition': 'opacity ' + speed,
                            'transition': 'opacity ' + speed
                        });
                    }
                    iElement.attr('src', $scope.lazySrc);
                }else{
                    var uid = getUid(iElement);
                    iElement.css({
                        'background-color': '#fff',
                        'opacity': 0,
                        '-webkit-transition': 'opacity ' + speed,
                        'transition': 'opacity ' + speed
                    });
                    elements[uid] = {
                        iElement: iElement,
                        $scope: $scope
                    };
                }
            });

            $scope.$on('$destroy', function(){
                iElement.unbind('load');
                var uid = getUid(iElement);
                if(elements.hasOwnProperty(uid)){
                    delete elements[uid];
                }
            });
        }
    };
}]);
