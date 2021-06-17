angular.module('intia.services.index', [])

    .factory('IndexSrv', ['$window', '$timeout',
        function ($window, $timeout)
        {
            'use strict';

            var currentHour = 0;

            var sideWidth                   = 400,      //cf css @sideWidth

                __resizeCover               = function (image)
                {
                    var ngElement = angular.element(image);

                    var width = image.offsetWidth;
                    var height = image.offsetHeight;

                    var bodyWidth = $window.innerWidth - sideWidth;
                    var bodyHeight = $window.innerHeight;

                    var ratio = width / height;

                    width = bodyHeight * ratio;
                    height = bodyHeight;
                    /*istanbul ignore if*/
                    if (bodyHeight * ratio < bodyWidth)
                    {
                        width = bodyWidth;
                        height = bodyWidth / ratio;
                    }

                    ngElement.css(
                        {
                            'width': width + 'px',
                            'height': height + 'px',
                            'top': '0px'
                        }
                    );

                    __computeBackgroundPosition();
                },

                __computeBackgroundPosition = function ()
                {
                    //translation of all the background
                    var background = document.getElementById('background-container');
                    var ngBackground = angular.element(background);

                    var imageWidth = background.offsetWidth;
                    var bodyWidth = $window.innerWidth - sideWidth;
                    var delta = imageWidth - bodyWidth;
                    var step = delta / nbStep;
                    var left = currentHour * step;
                    ngBackground.css(
                        {'left': -left + 'px'}
                    );
                },


                /**
                 * Compute :
                 *  - X position of gradient
                 *  - radius of gradient
                 *  - opacity
                 *  by a linear interpolation between
                 *  - start, end
                 *
                 * @param startT
                 * @param startGradient
                 * @param startRadius
                 * @param startOpacity
                 * @param endT
                 * @param endGradient
                 * @param endRadius
                 * @param endOpacity
                 * @returns {{gradientX: *, radius: *, opacity: *}}
                 */
                __computeSVGComponent       = function (startT, startGradient, startRadius, startOpacity, startColor, endT, endGradient, endRadius, endOpacity, endColor)
                {
                    var res    = {
                            gradientX: startGradient,
                            radius: startRadius,
                            opacity: startOpacity
                        },
                        nbStep = endT - startT;

                    if ((undefined !== endGradient) && (undefined !== startGradient))
                    {
                        var deltaGradient = endGradient - startGradient;
                        var stepGradient = deltaGradient / nbStep;

                        res.gradientX = startGradient + (currentHour - startT) * stepGradient;
                    }

                    if ((undefined !== endRadius) && (undefined !== startRadius))
                    {
                        var deltaRadius = endRadius - startRadius;
                        var stepRadius = deltaRadius / nbStep;

                        res.radius = startRadius + (currentHour - startT) * stepRadius;
                    }

                    if ((undefined !== endOpacity) && (undefined !== startOpacity))
                    {
                        var deltaOpacity = endOpacity - startOpacity;
                        var stepOpacity = deltaOpacity / nbStep;

                        res.opacity = startOpacity + (currentHour - startT) * stepOpacity;
                    }

                    if (startColor && endColor)
                    {
                        var deltaR = (startColor.R - endColor.R) / (nbStep - 2),
                            deltaG = (startColor.G - endColor.G) / (nbStep - 2),
                            deltaB = (startColor.B - endColor.B) / (nbStep - 2);

                        res.R = startColor.R - ((currentHour - startT) * deltaR);
                        res.G = startColor.G - ((currentHour - startT) * deltaG);
                        res.B = startColor.B - ((currentHour - startT) * deltaB);

                        /*istanbul ignore if*/
                        if (res.R > 255)
                        {
                            res.R = 255;
                        }
                        /*istanbul ignore if*/
                        if (res.G > 255)
                        {
                            res.G = 255;
                        }
                        /*istanbul ignore if*/
                        if (res.B > 255)
                        {
                            res.B = 255;
                        }
                        /*istanbul ignore if*/
                        if (res.R < 0)
                        {
                            res.R = 0;
                        }
                        /*istanbul ignore if*/
                        if (res.G < 0)
                        {
                            res.G = 0;
                        }
                        /*istanbul ignore if*/
                        if (res.B < 0)
                        {
                            res.B = 0;
                        }
                    }
                    return res;
                },

                __rgbToHex                  = function (r, g, b)
                {
                    /*istanbul ignore if*/
                    if (r > 255 || g > 255 || b > 255)
                    {
                        throw 'Invalid color component';
                    }

                    var result = ((r << 16) | (g << 8) | b).toString(16); // jshint ignore:line
                    result = '#' + ('000000' + result).slice(-6);
                    return result;
                },

                /**
                 * Compute :
                 *  - X position of gradient
                 *  - radius of gradient
                 *  - opacity
                 *  by a linear interpolation between
                 *  - start, mid
                 *  - mid, end
                 *  - end, end2
                 *
                 *
                 * @param idGradient Identifiant of the gradient to modify position and radius
                 * @param idPath Identifiant of the path to modify opacity
                 * @param startT
                 * @param startGradient
                 * @param startRadius
                 * @param startOpacity
                 * @param midT
                 * @param midGradient
                 * @param midRadius
                 * @param midOpacity
                 * @param endT
                 * @param endGradient
                 * @param endRadius
                 * @param endOpacity
                 * @param endT2
                 * @param endGradient2
                 * @param endRadius2
                 * @param endOpacity2
                 * @param endT3
                 * @param endGradient3
                 * @param endRadius3
                 * @param endOpacity3
                 */
                __modifySVG                 = function (idGradient, idPath, colorIsFill, startT, startGradient, startRadius, startOpacity, startColor, midT, midGradient, midRadius, midOpacity, midColor, endT, endGradient, endRadius, endOpacity, endColor, endT2, endGradient2, endRadius2, endOpacity2, endColor2, endT3, endGradient3, endRadius3, endOpacity3, endColor3)
                {
                    /*istanbul ignore if*/
                    if (angular.isUndefined(svgDoc))
                    {
                        return;
                    }

                    var svgComponent;

                    if ((currentHour > endT2) && (undefined !== endT3))
                    {
                        svgComponent = __computeSVGComponent(endT2, endGradient2, endRadius2, endOpacity2, endColor2, endT3, endGradient3, endRadius3, endOpacity3, endColor3);
                    }
                    else if ((currentHour > endT) && (undefined !== endT2))
                    {
                        svgComponent = __computeSVGComponent(endT, endGradient, endRadius, endOpacity, endColor, endT2, endGradient2, endRadius2, endOpacity2, endColor2);
                    }
                    else if (currentHour > midT)
                    {
                        svgComponent = __computeSVGComponent(midT, midGradient, midRadius, midOpacity, midColor, endT, endGradient, endRadius, endOpacity, endColor);
                    }
                    else if (currentHour >= startT)
                    {
                        svgComponent = __computeSVGComponent(startT, startGradient, startRadius, startOpacity, startColor, midT, midGradient, midRadius, midOpacity, midColor);
                    }

                    if (idGradient && idGradient !== '')
                    {
                        var gradientReflectionLeft = svgDoc.getElementById(idGradient);
                        if (gradientReflectionLeft)
                        {
                            if (undefined !== svgComponent.gradientX)
                            {
                                gradientReflectionLeft.setAttribute('cx', svgComponent.gradientX);
                            }

                            if (undefined !== svgComponent.radius)
                            {
                                gradientReflectionLeft.setAttribute('r', svgComponent.radius);
                            }

                            if (undefined !== svgComponent.R)
                            {
                                var color = __rgbToHex(svgComponent.R, svgComponent.G, svgComponent.B);
                                if (colorIsFill)
                                {
                                    gradientReflectionLeft.setAttribute('fill', color);
                                }
                                else
                                {
                                    var childs = angular.element(gradientReflectionLeft).children();
                                    if (childs.length > 0)
                                    {
                                        childs[0].setAttribute('style', 'stop-color:' + color);
                                    }
                                }
                            }
                        }
                    }


                    if (idPath && (idPath !== '') && (undefined !== svgComponent.opacity))
                    {
                        var pathLeft = svgDoc.getElementById(idPath);
                        if (pathLeft)
                        {
                            if (svgComponent.opacity < 0)
                            {
                                svgComponent.opacity = 0;
                            }
                            if (svgComponent.opacity > 1)
                            {
                                svgComponent.opacity = 1;
                            }

                            pathLeft.setAttribute('opacity', svgComponent.opacity);
                        }
                    }
                },

                __resizeSVG                 = function ()
                {
                    var background = document.getElementById('background-container');
                    if(background)
                    {
                        __resizeCover(background);
                    }
                },

                nbStep                      = 1440,
                svgDoc                      = null;

            var exports =
                {
                    setCurrentHour: function(value)
                    {
                        currentHour = value;
                    },

                    /**
                     * Modify gradient position, radius and opacity of svg layers in function of currentHour
                     */
                    __drawBackground: function ()
                    {
                        //start by change x position of the background
                        __computeBackgroundPosition();

                        /*istanbul ignore if*/
                        if (!svgDoc)
                        {
                            //in case where svg is not integrate by the browser, svg has been replaced by png
                            return;
                        }

                        var minXGradientSky   = 0,
                            maxXGradientSky   = 1200,
                            deltaXGradientSky = maxXGradientSky - minXGradientSky,
                            stepXGradientSky  = deltaXGradientSky / nbStep,

                            xGradientSky      = minXGradientSky + (currentHour * stepXGradientSky),
                            radX              = (Math.PI * xGradientSky / 180),
                            yGradientSky      = (450 * Math.sin((-radX / 5) - 100)) + 450,
                            radXOpacity       = (Math.PI * (xGradientSky + 200) / 180),
                            opacitySky        = Math.sin(radXOpacity / 6.5 + 100) + 0.1;

                        /*istanbul ignore if*/
                        if (opacitySky < 0)
                        {
                            opacitySky = 0;
                        }
                        /*istanbul ignore if*/
                        if (opacitySky > 0.75)
                        {
                            opacitySky = 0.75;
                        }

                        //Sky
                        var gradientSky = svgDoc.getElementById('gradientSky');
                        gradientSky.setAttribute('cx', xGradientSky);
                        gradientSky.setAttribute('cy', yGradientSky);

                        var pathSky = svgDoc.getElementById('pathSky');
                        pathSky.setAttribute('opacity', opacitySky);

                        var CielBleuPath = svgDoc.getElementById('CielBleuPath');
                        CielBleuPath.setAttribute('opacity', opacitySky);

                        //change only gradient radius
                        //__modifySVG(
                        //                 'gradientSky' /*idGradient*/, '' /*idPath*/,
                        //                 false,
                        //                 0 /*290 startT*/,
                        //                 undefined /*230 startGradient*/,
                        //                 546 /*140 startRadius*/,
                        //                 undefined /*0.2 startOpacity*/,
                        //                 undefined,
                        //                 520 /*midT*/,
                        //                 undefined /*midGradient*/,
                        //                 546 /*midRadius*/,
                        //                 undefined /*midOpacity*/,
                        //                 undefined,
                        //                 1440 /*endT*/,
                        //                 undefined /*endGradient*/,
                        //                 1000 /*endRadius*/,
                        //                 undefined /*endOpacity*/);

                        //changeColor
                        __modifySVG(
                            'gradientSky' /*idGradient*/, '' /*idPath*/,
                            false,
                            0 /*290 startT*/,
                            undefined /*230 startGradient*/,
                            546 /*140 startRadius*/,
                            undefined /*0.2 startOpacity*/,
                            {R: 255, G: 251, B: 135},         //FFFB87

                            600 /*midT*/,
                            undefined /*midGradient*/,
                            546 /*midRadius*/,
                            undefined /*midOpacity*/,
                            {R: 249, G: 227, B: 16},          //F9E310

                            890 /*midT*/,
                            undefined /*midGradient*/,
                            600 /*midRadius*/,
                            undefined /*midOpacity*/,
                            //{R:255, G:241, B:56},          //FFF138
                            {R: 249, G: 227, B: 16},          //F9E310

                            1440 /*endT*/,
                            undefined /*endGradient*/,
                            1000 /*endRadius*/,
                            undefined /*endOpacity*/,
                            {R: 255, G: 96, B: 61});          //FF603D

                        //ciel Bleu
                        __modifySVG(
                            'CielBleuPath' /*idGradient*/, '' /*idPath*/,
                            true,
                            0 /*290 startT*/,
                            undefined /*230 startGradient*/,
                            undefined /*140 startRadius*/,
                            undefined /*0.2 startOpacity*/,
                            {R: 0, G: 85, B: 255},

                            750 /*midT*/,
                            undefined /*midGradient*/,
                            undefined /*midRadius*/,
                            undefined /*midOpacity*/,
                            {R: 162, G: 189, B: 244},     //A2BDF4

                            1440 /*midT*/,
                            undefined /*midGradient*/,
                            undefined /*midRadius*/,
                            undefined /*midOpacity*/,
                            {R: 0, G: 85, B: 255});

                        //reflection Left
                        __modifySVG(
                            'gradientReflectionLeft' /*idGradient*/, 'pathLeft' /*idPath*/,
                            false,
                            0 /*290 startT*/,
                            150 /*230 startGradient*/,
                            100 /*140 startRadius*/,
                            0 /*0.2 startOpacity*/,
                            undefined,
                            800 /*midT*/,
                            390 /*midGradient*/,
                            340 /*midRadius*/,
                            1 /*midOpacity*/,
                            undefined,
                            1440 /*endT*/,
                            470 /*endGradient*/,
                            520 /*endRadius*/,
                            0 /*endOpacity*/);


                        //reflection Right
                        __modifySVG(
                            'gradientReflectionRight' /*idGradient*/, 'pathRight' /*idPath*/,
                            false,
                            0 /*290 startT*/,
                            340 /*230 startGradient*/,
                            undefined /*140 startRadius*/,
                            0 /*0.2 startOpacity*/,
                            undefined,
                            250 /*midT*/,
                            510 /*midGradient*/,
                            undefined /*midRadius*/,
                            0.1 /*midOpacity*/,
                            undefined,
                            800 /*endT*/,
                            590 /*endGradient*/,
                            undefined /*endRadius*/,
                            1 /*endOpacity*/,
                            undefined,
                            1440 /*endT2*/,
                            840 /*endGradient2*/,
                            undefined /*endRadius2*/,
                            0 /*endOpacity2*/
                        );

                        //light
                        __modifySVG(
                            '' /*idGradient*/, 'light' /*idPath*/,
                            false,
                            0 /*290 startT*/,
                            undefined /*230 startGradient*/,
                            undefined /*140 startRadius*/,
                            1 /*0.2 startOpacity*/,
                            undefined,
                            310 /*midT*/,
                            undefined /*midGradient*/,
                            undefined /*midRadius*/,
                            0 /*midOpacity*/,
                            undefined,
                            1130 /*endT*/,
                            undefined /*endGradient*/,
                            undefined /*endRadius*/,
                            0 /*endOpacity*/,
                            undefined,
                            1440 /*endT2*/,
                            undefined /*endGradient2*/,
                            undefined /*endRadius2*/,
                            1 /*endOpacity2*/
                        );

                        //cloud
                        __modifySVG(
                            '' /*idGradient*/, 'pathCloud' /*idPath*/,
                            false,
                            0 /*290 startT*/,
                            undefined /*230 startGradient*/,
                            undefined /*140 startRadius*/,
                            1 /*0.2 startOpacity*/,
                            undefined,
                            //350 /*midT*/,
                            //undefined /*midGradient*/,
                            //undefined /*midRadius*/,
                            //1 /*midOpacity*/,
                            //undefined,
                            600 /*endT*/,
                            undefined /*endGradient*/,
                            undefined /*endRadius*/,
                            0.05 /*endOpacity*/,
                            undefined,
                            1020 /*endT2*/,
                            undefined /*endGradient2*/,
                            undefined /*endRadius2*/,
                            0.05 /*endOpacity2*/,
                            undefined,
                            1440 /*endT3*/,
                            undefined /*endGradient3*/,
                            undefined /*endRadius3*/,
                            1 /*endOpacity3*/
                        );


                        //pathPonts
                        __modifySVG(
                            'pathPonts' /*idGradient*/, 'pathPonts' /*idPath*/,
                            true,
                            0 /*290 startT*/,
                            undefined /*230 startGradient*/,
                            undefined /*140 startRadius*/,
                            undefined /*0.2 startOpacity*/,
                            {R: 0, G: 0, B: 0},
                            250 /*midT*/,
                            undefined /*midGradient*/,
                            undefined /*midRadius*/,
                            undefined /*midOpacity*/,
                            {R: 30, G: 30, B: 30},
                            1000 /*endT*/,
                            undefined /*endGradient*/,
                            undefined /*endRadius*/,
                            undefined /*endOpacity*/,
                            {R: 30, G: 30, B: 30},
                            1440 /*endT2*/,
                            undefined /*endGradient2*/,
                            undefined /*endRadius2*/,
                            undefined /*endOpacity2*/,
                            {R: 0, G: 0, B: 0}
                        );
                    },

                    initBackground: function ()
                    {
                        var today = new Date();
                        today.setHours(0);
                        today.setMinutes(0);
                        today.setSeconds(0);

                        var now = new Date();
                        var diff = Math.abs(now - today);
                        exports.setCurrentHour(Math.floor((diff / 1000) / 60));

                        angular.element($window).bind('resize', function ()
                        {
                            /*istanbul ignore next*/
                            __resizeSVG();
                        });

                        __resizeSVG();

                        angular.element($window).bind('load', function ()
                        {
                            svgDoc = null;
                            var embed = document.getElementById('embed-background');

                            if (!embed)
                            {
                                return;
                            }

                            /*istanbul ignore if*/
                            if (embed.contentDocument)
                            {
                                svgDoc = embed.contentDocument;
                            }
                            else
                            {
                                svgDoc = embed.getSVGDocument();
                            }

                            if (angular.isDefined(svgDoc))
                            {
                               exports.__drawBackground();
                            }
                        });
                    }
                };

            return exports;

        }
    ]);