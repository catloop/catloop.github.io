(function(angular) {
    var mpsDirectives = angular.module('mpsDirectives', [])
        .directive('modalAlert', [function() {
            return {
                restrict: 'EACM',
                template: '<div class="modal fade alert-modal-lg" id="modalAlert" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog" ng-class="modal.alert.size"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="myModalLabel" ng-bind="modal.alert.title">Modal title</h4></div><div class="modal-body" ng-bind-html="modal.alert.content"></div><div class="modal-footer" ng-if="modal.alert.footer"><button type="button" class="btn btn-primary" data-dismiss="modal">确定</button></div></div></div></div>',
                replace: true,
                link: function postLink(scope, element, attr) {
                    // 垂直居中模态框
                    function reposition() {
                        var modal = element;
                        var dialog = modal.find('.modal-dialog');
                        modal.css('display', 'block');
                        // Dividing by two centers the modal exactly, but dividing by three 
                        // or four works better for larger screens.
                        dialog.css('margin-top', Math.max(0, ($(window).height() - dialog.height()) / 2));
                        modal.css('display', '');
                    }
                    // Reposition when a modal is shown
                    // element.on('show.bs.modal', reposition);
                    // 值改变时重新定位
                    scope.$watch('modal', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            reposition();
                        }
                    }, true);
                    // Reposition when the window is resized
                    $(window).on('resize', function() {
                        $('.modal:visible').each(reposition);
                    });
                }
            }
        }])

        // canvas 增强，可占满父容器
        .directive('canvas', ['$timeout', '$window', function($timeout, $window) {
            return {
                restrict: 'E',
                link: function(scope, element, attr) {
                    // 包含 fillSize 属性
                    if (attr.hasOwnProperty('fillSize')) {
                        // 定义含 getter 的对象，返回父元素宽高，以及 canvas 要读取的图片 src
                        scope.variables = {
                            get parentWidth() {
                                return element.parent().width();
                            },
                            get parentHeight() {
                                return element.parent().height();
                            }
                        };

                        function defineSize() {
                            element.prop('width', scope.variables.parentWidth);
                            element.prop('height', scope.variables.parentHeight);
                        }
                        defineSize();
                        // 监视宽高变化
                        scope.$watch('variables', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                // canvas 尺寸占满父容器
                                $timeout(function() {
                                    defineSize();
                                });
                            }
                        }, true);
                    }
                }
            }
        }])

        // 将图片 src 渲染到 canvas 
        .directive('canvasSrc', ['FileSrv', '$timeout', function(FileSrv, $timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    scope.size = {
                        get width() {
                            return element.prop('width');
                        },
                        get height() {
                            return element.prop('height');
                        }
                    };

                    function observe(newVal, oldVal) {
                        if (newVal && newVal !== oldVal) {
                            FileSrv.canvasRender(element[0], attr.canvasSrc);
                        }
                    }

                    attr.$observe('canvasSrc', observe);
                    scope.$watch('size', observe, true);
                }
            }
        }])

        .directive('spinner', [function() {
            return {
                restrict: 'EACM',
                template: '<div class="shade" ng-if="spinnerShow"><div class="loader"></div></div>',
                replace: true,
                link: function($rootScope) {
                    $rootScope.$watch('spinnerShow', function(newVal, oldVal) {
                        if (newVal === oldVal) return;
                        if (newVal) {
                            $('body').css({ overflow: 'hidden', paddingRight: 15 })
                        } else {
                            $('body').css({ overflow: '', paddingRight: '' })
                        }
                    });
                }
            }
        }])

        .directive('repeatFinish', [function() {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    console.log(scope.$index)
                    if (scope.$last == true) {
                        scope.$eval(attr.repeatFinish);
                    }
                }
            }
        }])

        .directive('docMode', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                link: function() {

                }
            }
        }])

        .directive('myRadio', [function() {
            return {
                restrict: 'E',
                template: function(ele, attr) {
                    var html = '<label><i class="fa" ng-class="{\'fa-circle-o\': !' + attr.ngModel + ', \'fa-dot-circle-o\': ' + attr.ngModel + '}"></i><input type="radio" class="" ng-model="' + attr.ngModel + '" name="' + attr.name + '"><label>';
                    return html;
                },
                replace: true,
                link: function(scope, element, attr) {
                    element.find('input[type=radio]').on('change', function() {
                        scope.$apply();
                        console.log(scope);
                    });
                }
            }
        }])

        .directive('cameraView', [function() {
            return {
                restrict: 'E',
                template: '<div class="camera-view">' +
                    '<video ng-show="permission"></video>' +
                    '<div class="denied" ng-if="!permission"><i class="fa fa-video-camera"></i><p>未检测到摄像头，确认摄像头已连接并允许浏览器使用。</p></div>' +
                    '<canvas class="hidden"></canvas>' +
                    '<div class="flash-light"></div>' +
                    '<div class="capture" ng-if="permission && allowcapture && loaded" ng-click="flash()"><i class="fa fa-camera"></i></div>' +
                    '</div>',
                replace: true,
                scope: {
                    allowcapture: '=allowcapture',
                    oncapture: '=oncapture'
                },
                link: function(scope, element, attr) {
                    console.log(scope);
                    // Grab elements, create settings, etc.
                    var canvas = element.find("canvas")[0],
                        context = canvas.getContext("2d"),
                        video = element.find("video")[0],
                        videoObjNg = {
                            audio: false,
                            video: {
                                width: { min: 1280 },
                                height: { min: 720 }
                            }
                        },
                        videoObjLegacy = {
                            audio: false,
                            video: {
                                optional: [
                                    { minWidth: 320 },
                                    { minWidth: 640 },
                                    { minWidth: 1024 },
                                    { minWidth: 1280 },
                                    { minWidth: 1920 },
                                    { minWidth: 2560 }
                                ]
                            }
                        },
                        errBack = function(error) {
                            console.log("Video capture error: ", error.code);
                            scope.permission = false;
                        };

                    // canvas 大小与 video 同步
                    video.onloadeddata = function() {
                        scope.loaded = true;
                        scope.$apply('loaded');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    };

                    // 保存 localMediaStream 对象，用来释放摄像头
                    var mediaStream;
                    // Put video listeners into place
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { // W3C
                        navigator.mediaDevices.getUserMedia(videoObjNg)
                            .then(function(stream) {
                                mediaStream = stream;
                                scope.permission = true;
                                scope.$apply('permission');
                                video.src = window.URL.createObjectURL(stream);
                                video.play();
                            })
                            .catch(errBack);
                    } else if (navigator.getUserMedia) { // Old
                        navigator.getUserMedia(videoObjLegacy, function(stream) {
                            mediaStream = stream;
                            scope.permission = true;
                            scope.$apply('permission');
                            video.src = window.URL.createObjectURL(stream);
                            video.play();
                        }, errBack);
                    } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
                        navigator.webkitGetUserMedia(videoObjLegacy, function(stream) {
                            mediaStream = stream;
                            scope.permission = true;
                            scope.$apply('permission');
                            video.src = window.webkitURL.createObjectURL(stream);
                            video.play();
                        }, errBack);
                    } else if (navigator.mozGetUserMedia) { // Firefox-prefixed
                        navigator.mozGetUserMedia(videoObjLegacy, function(stream) {
                            mediaStream = stream;
                            scope.permission = true;
                            scope.$apply('permission');
                            video.src = window.URL.createObjectURL(stream);
                            video.play();
                        }, errBack);
                    }

                    // 拍照取图
                    var flashLight = element.find('.flash-light');
                    scope.flash = function() {
                        // 触发 animation 闪光效果
                        flashLight.show();
                        // 将图像绘制到 canvas 上
                        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                        // 将 canvas 转为 blob
                        canvas.toBlob(function(blob) {
                            var file = (new File([blob], Date.now() + '.jpg', { type: 'image/jpeg', size: blob.size }));
                            scope.oncapture && scope.oncapture(file);
                        }, 'image/jpeg', .7);
                    };

                    // 动画结束后再次隐藏闪光层
                    flashLight.on('animationend', function() {
                        flashLight.hide();
                    });

                    // 指令作用域销毁时释放摄像头
                    scope.$on('$destroy', function() {
                        if (mediaStream) {
                            mediaStream.getTracks()[0].stop();
                        }
                    })

                }
            }
        }])

        // 模态框映射，将元素内容映射到模态框，并创建打开模态框的按钮
        .directive('modalMap', [function() {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    // 标签上属性值为 false 则不执行
                    if (attr.modalMap && !JSON.parse(attr.modalMap)) {
                        return;
                    }
                    // 初始化模态框与展开按钮，返回模态框的 ID
                    var init = function() {
                        // 定义模态框内容与 ID
                        var content = element.html();
                        var modalId = "modalMap" + Date.now();
                        // 初始化模态框内容
                        var modalHtml = ['<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="myModalLabel">查看详情</h4></div><div class="modal-body">',
                            content,
                            '</div></div></div></div>'
                        ];
                        var $modal = $(modalHtml.join(''));
                        var $content = $modal.find('.modal-body');
                        // 初始化按钮内容
                        var buttonHtml = '<button class="full-screen" title="查看详情" data-toggle="modal" data-target="#' + modalId + '"><i></i><span>查看详情</span></button>';
                        var $button = $(buttonHtml);
                        // 点击按钮同步当前的 html 到模态框
                        $button.click(function() {
                            $content.html(element.html());
                        });
                        // 模态框添加到页面
                        $(document.body).append($modal);
                        // 按钮添加到元素下方
                        element.after($button);
                        // 返回 ID 值
                        return modalId;
                    };

                    var modalId = init();

                    // 作用域销毁时删除模态框与按钮
                    scope.$on('$destroy', function() {
                        $('#' + modalId).remove();
                        $('[data-target="#' + modalId + '"]').remove();
                    });
                }
            }
        }])

        // 为图片添加类似 B2C 网站的放大预览效果
        .directive('zoomPop', ['$timeout', '$window', function($timeout, $window) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    var $img = element.find('img');
                    var $parent = element.parent();
                    var imgW, imgH;
                    var $easyZoom, api;
                    $img.on('load', function(e) {
                        imgH = $parent.height();
                        imgW = $parent.height() / e.target.height * e.target.width;
                        if (imgW > $parent.width) {
                            imgW = $parent.width;
                            imgH = $parent.height() / e.target.width * e.target.height;
                        }
                        element.css({
                            width: imgW,
                            height: imgH
                        })
                        if (!$easyZoom) {
                            $easyZoom = element.addClass('easyzoom easyzoom--adjacent').easyZoom();
                            api = $easyZoom.data('easyZoom');
                        } else {
                            api.teardown();
                            api._init();
                        }
                    });
                    // 输出图片地址
                    Object.defineProperty(scope, 'imgSrc',{
                        get: function() {
                            return element.find('img').attr('src');
                        }
                    });
                    // 监听图片地址，改变时重新初始化
                    /*scope.$watch('imgSrc', function(newVal, oldVal) {
                        api.teardown();
                        api._init();
                    });*/
                }
            }
        }])

        // PDF 预览
        .directive('pdfViewer', ['$window', function($window) {
            return {
                restrict: 'AE',
                link: function(scope, element, attr) {
                    // 加载额外资源
                    PDFJS.imageResourcesPath = 'lib/pdfjs/build/generic/web/images/';
                    PDFJS.workerSrc = 'lib/pdfjs/build/generic/build/pdf.worker.js';
                    PDFJS.cMapUrl = 'lib/pdfjs/build/generic/web/cmaps/';
                    PDFJS.cMapPacked = true;
                    // 是否显示复数图片
                    var multiple = attr.hasOwnProperty('multiple');
                    function renderPDF(pdf, index) {
                        pdf.getPage(index).then(function(page) {
                            var canvas = document.createElement('canvas');
                            var context = canvas.getContext('2d');
                            var scale = 1.3333333333333333;
                            var viewport = page.getViewport(scale);
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            var renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            page.render(renderContext);
                            element.prepend(canvas);
                        });
                    }
                    function observe() {
                        // src 无值退出
                        if (!attr.pdfSrc) {
                            return;
                        }

                        element.empty();

                        PDFJS.getDocument(attr.pdfSrc).then(function(pdf) {
                            if (!multiple) {
                                renderPDF(pdf, 1);
                                return;
                            }
                            var length = pdf.numPages;
                            while (length--) {
                                var pageIndex = length + 1;
                                renderPDF(pdf, pageIndex);
                            }
                        });
                    }
                    attr.$observe('pdfSrc', observe);
                }
            }
        }])

        // 缩放切换
        .directive('scaleBox', [function() {
            return {
                restrict: 'AE',
                template: '<div class="scale-box" ng-class="scaleModeMap[scaleMode].className"><div ng-transclude></div><button class="scale-switch" ng-click="switchScale()">{{scaleModeMap[scaleMode].text}}</button></div>',
                transclude: true,
                replace: true,
                link: function(scope, element, attr) {
                    // PDF 缩放模式
                    scope.scaleMode = 0;
                    scope.scaleModeMap = [{
                        text: '原始尺寸',
                        className: 'auto'
                    }, {
                        text: '自适应',
                        className: 'origin'
                    }];
                    scope.switchScale = function() {
                        scope.scaleMode = (scope.scaleMode + 1 < scope.scaleModeMap.length) ? scope.scaleMode + 1 : 0;
                    };
                } 
            }
        }])

        // 缩放切换
        .directive('transition', ['$window', function($window) {
            return {
                restrict: 'AE',
                template: '<div ng-transclude></div>',
                replace: true,
                transclude: true,
                link: function(scope, element, attr) {
                    var transClassName = attr.name || 'transition';
                    var start, end, delta;
                    scope.$on('$stateChangeStart', function() {
                        start = Date.now();
                        element.addClass(([transClassName + '-transition', transClassName + '-enter']).join(' '));
                    });
                    scope.$on('$stateChangeSuccess', function() {
                        end = Date.now();
                        delta = end - start;
                        var transitionDuration = parseFloat(element.css('transitionDuration')) * 1000;
                        var delay = delta > transitionDuration ? delta : transitionDuration;
                        $window.setTimeout(function() {
                            element.removeClass(transClassName + '-enter').addClass(transClassName + '-leave');
                            $window.setTimeout(function() {
                                element.removeClass([transClassName + '-leave', transClassName + '-transition'].join(' '));
                            }, transitionDuration);
                        }, delay);
                    });
                } 
            }
        }])

        // 缩放切换
        .directive('routerSpinner', ['$window', function($window) {
            return {
                restrict: 'AE',
                template: '<div class="router-spinner"></div>',
                replace: true,
                transclude: true,
                link: function(scope, element, attr) {
                    var timer, percent;
                    scope.$on('$stateChangeStart', function() {
                        percent = 0;
                        element.css({transition: 'none', opacity: 1, width: percent + '%'});
                        element.show();
                        timer = $window.setInterval(function() {
                            var delta = (70 - percent) / 100;
                            percent += delta;
                            element.css({width: percent + '%'});
                        }, 16.7);
                    });
                    scope.$on('$stateChangeSuccess', function() {
                        $window.clearTimeout(timer);
                        element.css({transition: '', width: '100%'});
                        var transitionDuration = parseFloat(element.css('transitionDuration')) * 1000;
                        $window.setTimeout(function() {
                            element.css({opacity: 0});
                            $window.setTimeout(function() {
                                element.hide();
                            }, transitionDuration);
                        }, transitionDuration);
                    });
                } 
            }
        }]);
})(window.angular);