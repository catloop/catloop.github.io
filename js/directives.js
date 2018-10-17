(function(angular) {
    var mpsDirectives = angular.module('mpsDirectives', [])

        // splash 设为透明后删除
        .directive('splash', [function() {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    element.on('transitionend', function() {
                        $(this).remove();
                    }).css('opacity', 0);
                }
            }
        }])

        // 模态框代替 alert
        .directive('modalAlert', [function() {
            return {
                restrict: 'EACM',
                templateUrl: './tpls/components/modalAlert.html',
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
                template: '<div class="shade" ng-if="spinnerShow"><div class="loader"><div></div><div></div><div></div><div></div></div></div>',
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
                    });
                }
            }
        }])

        .directive('cameraView', [function() {
            return {
                restrict: 'E',
                template: 'tpls/components/cameraView.html',
                replace: true,
                scope: {
                    allowcapture: '=allowcapture',
                    oncapture: '=oncapture'
                },
                link: function(scope, element, attr) {
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
        .directive('modalMap', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    // 标签上属性值为 false 或目标不存在，则不执行
                    if ((attr.modalMap && !JSON.parse(attr.modalMap)) || !attr.target) {
                        return;
                    }
                    $timeout(function() {
                        // 初始化模态框内容
                        var $modal = $('<div class="modal fade" id="' + attr.target + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="myModalLabel">查看详情</h4></div><div class="modal-body"></div></div></div></div>');
                        var $modalBody = $modal.find('.modal-body');
                        // 点击按钮同步当前的 html 到模态框
                        element.on('mousedown', function() {
                            var $target = $('[modalmap-id="' + attr.target + '"]');
                            if (!$target) {
                                return;
                            }
                            element.attr({
                                'data-target': '#' + attr.target,
                                'data-toggle': 'modal'
                            });
                            $modal.prop('id', attr.target);
                            $modalBody.html($target.html());
                        });
                        // 模态框添加到页面
                        $(document.body).append($modal);

                        // 作用域销毁时删除模态框与按钮
                        scope.$on('$destroy', function() {
                            $('#' + attr.target).remove();
                            $('[data-target="#' + attr.target + '"]').remove();
                        });
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
                    Object.defineProperty(scope, 'imgSrc', {
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
                            // var canvas = document.createElement('canvas');
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
                template: '<div class="scale-box" ng-class="scaleModeMap[scaleMode].className"><div ng-transclude></div><button class="scale-switch btn" ng-click="switchScale()">{{scaleModeMap[scaleMode].text}}<span class="rippleJS"></span></button></div>',
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
        .directive('transition', ['$window', '$state', '$timeout', function($window, $state, $timeout) {
            return {
                restrict: 'AE',
                template: '<div ng-transclude></div>',
                replace: true,
                transclude: true,
                link: function(scope, element, attr) {
                    var transClassName = attr.name || 'transition';
                    var start, end, delta;
                    element.addClass(transClassName + '-transition');
                    scope.$on('$stateChangeStart', function(e) {
                        start = Date.now();
                        element.addClass(transClassName + '-leave');
                    });
                    scope.$on('$stateChangeSuccess', function() {
                        end = Date.now();
                        delta = end - start;
                        var transitionDuration = parseFloat(element.css('transitionDuration')) * 1000;
                        var delay = delta > transitionDuration ? 0 : transitionDuration;
                        $window.setTimeout(function() {
                            element.removeClass(transClassName + '-leave').addClass(transClassName + '-enter');
                            $window.setTimeout(function() {
                                element.removeClass(transClassName + '-enter');
                            }, transitionDuration);
                        }, delay);
                    });
                }
            }
        }])

        // 顶部载入进度条
        .directive('routerSpinner', ['$window', function($window) {
            return {
                restrict: 'AE',
                template: '<div class="router-spinner"></div>',
                replace: true,
                transclude: true,
                link: function(scope, element, attr) {
                    var timer, percent;
                    scope.$on('$stateChangeStart', function() {
                        timer && $window.clearInterval(timer);
                        percent = 0;
                        element.css({ transition: 'none', opacity: 1, width: percent + '%' });
                        element.show();
                        timer = $window.setInterval(function() {
                            var delta = (70 - percent) / 100;
                            percent += delta;
                            element.css({ width: percent + '%' });
                        }, 16.7);
                    });
                    scope.$on('$stateChangeSuccess', function() {
                        $window.clearInterval(timer);
                        element.css({ transition: '', width: '100%' });
                        var transitionDuration = parseFloat(element.css('transitionDuration')) * 1000;
                        $window.setTimeout(function() {
                            element.css({ opacity: 0 });
                            $window.setTimeout(function() {
                                element.hide();
                            }, transitionDuration);
                        }, transitionDuration);
                    });
                }
            }
        }])

        // 队列渐变显现动画
        .directive('queueTrans', ['$timeout', function($timeout) {
            return {
                restrict: 'AE',
                link: function(scope, element, attr) {
                    // 附有类名动画名称（animation-name）的
                    var animateClass = attr.animateClass || 'animate';
                    // 动画历时
                    var animateDuration = attr.animateDuration ? parseFloat(attr.animateDuration) : .5;
                    // 每个元素动画开始的间隔
                    var animateInterval = attr.animateInterval ? parseFloat(attr.animateInterval) : .1;
                    // 滚动延迟像素，默认滚动到屏幕内 200 像素后触发动画
                    var delayPixel = attr.delayPixel || 200;
                    var $items;

                    function animatify() {
                        // 对队列里的元素逐一添加动画的时长与延迟属性，并最后添加附带有动画名称的类名
                        $items.each(function(i, v) {
                                v.style.animationDuration = animateDuration + 's'
                                v.style.animationDelay = i * animateInterval + 's';
                            })
                            .addClass(attr.animateClass);
                    }
                    // 滚动时检测高度判断是否执行动画
                    function scrollDetect(callback) {
                        var allowAnimate = (element.offset().top + delayPixel) < ($(window).scrollTop() + $(window).height());
                        if (allowAnimate) {
                            // 如果此时满足动画执行要求，执行动画
                            animatify();
                            // 并执行回调函数
                            callback && callback();
                        }
                        return allowAnimate;
                    }
                    // 
                    $timeout(function() {
                        $items = element.children();
                        // 将元素透明度设为 0，使其初始不可见，避免类名添加时元素已经存在，导致其显示在原有位置，在 delay 后瞬间跳至动画 from 状态的怪异效果；并在动画开始时使其可见
                        $items.css({ 'opacity': '0' })
                            .one('animationstart', function() {
                                $(this).css('opacity', '');
                            })
                            // 动画完成后去除添加的属性
                            .one('animationend', function() {
                                $(this).css({
                                    animationDuration: '',
                                    animationDelay: ''
                                });
                            });
                        var wrapFn = function() {
                            scrollDetect(function() {
                                $(window).off('scroll', wrapFn);
                            })
                        };
                        if (!scrollDetect()) {
                            $(window).on('scroll', wrapFn);
                        }
                    });
                }
            }
        }])

        // 业务组件：登录与注册模态框
        .directive('loginModal', ['$rootScope', '$http', 'Api', 'UI', '$window', function($rootScope, $http, Api, UI, $window) {
            return {
                restrict: 'AE',
                replace: true,
                templateUrl: './tpls/components/loginModal.html',
                link: function(scope, element, attr) {
                    var $loginModal = element;
                    attr.$observe('modal', function(newVal, oldVal) {
                        // modal 属性控制模态框显示隐藏
                        if (newVal !== oldVal) {
                            $loginModal.modal(newVal ? 'show' : 'hide');
                        }
                    });
                    scope.login = function() {
                        scope.loading = true;
                        $http({
                                method: 'POST',
                                url: Api.login,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'X-Requested-With': 'XMLHttpRequest'
                                },
                                data: 'userName=' + scope.loginUsername + '&password=' + scope.loginPassword
                            })
                            .then(function(res) {
                                if (res.data.state === 'success') {
                                    $window.localStorage.setItem('token', res.data.token);
                                    // 重新获取登录状态与服务配置参数
                                    $rootScope.getLoginStatus();
                                    // 广播登录完成
                                    $rootScope.$broadcast('loginSuccess');
                                    // 界面通知
                                    $rootScope.notify.open({ title: '成功', content: '登录成功！', type: 'success' });
                                } else {
                                    $rootScope.notify.open({ title: '错误', content: res.data.message, type: 'error' });
                                }
                                scope.loading = false;
                            });
                    };
                }
            }
        }])

        // 返回顶部
        .directive('backToTop', [function() {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    var $window = $(window);
                    // 视图显示
                    Object.defineProperty(scope, 'show', {
                        get: function() {
                            return $window.scrollTop() > 100;
                        }
                    });
                    // 滚动时更新 show 值
                    $window.on('scroll', function(e) {
                        e.stopPropagation();
                        scope.$apply('show');
                    });
                    // 监视滚动高度，显示与隐藏
                    scope.$watch('show', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            element[(newVal ? 'add' : 'remove') + 'Class']('show');
                        }
                    }, true);
                    // 点击回顶部
                    element.click(function() {
                        $('html, body').animate({ scrollTop: 0 }, 500);
                    });
                }
            }
        }])

        // 动态的导航指示器
        .directive('somewhatClouds', ['$rootScope', '$timeout', function($rootScope, $timeout) {
            return {
                restrict: 'AE',
                replace: true,
                link: function(scope, element, attr) {
                    var $cloud = $('<div>').addClass('somewhat-clouds');
                    element.after($cloud);

                    function computePosition() {
                        $timeout(function() {
                            var $activedNav = element.find('>li.active');
                            if (!$activedNav.length) {
                                $cloud.css({ width: '' });
                                return;
                            }
                            var left = $activedNav.offset().left;
                            var width = $activedNav.width();
                            $cloud.css({ left: left, width: width });

                        });
                    }

                    $rootScope.$on('$stateChangeSuccess', function() {
                        computePosition();
                    });

                    $(window).on('resize', function() {
                        computePosition();
                    });
                }
            }
        }])

        // 动态锚点滚动
        .directive('dynamicScroll', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    element.click(function() {
                        var $target = $(attr.dynamicScroll);
                        if (!$target.length) {
                            return;
                        }
                        var top = $target.offset().top;
                        $('html, body').animate({ scrollTop: top }, 500);
                    });
                }
            }
        }])

        // 业务组件：固定二维码
        .directive('fixedQrcode', [function() {
            return {
                restrict: 'E',
                templateUrl: './tpls/components/fixedQrcode.html',
                replace: true,
                link: function(scope, element, attr) {
                    scope.hideQrCode = false;
                }
            }
        }])

        // cropperjs 框选工具
        .directive('cropper', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                scope: {
                    cropper: '=cropper'
                },
                link: function(scope, element, attr) {
                    var cropper;
                    scope.$watch('cropper', function(newVal, oldVal) {
                        if (!newVal) {
                            return;
                        }
                        // 切换时，不同 cropper 需要先销毁之前的
                        if (newVal.id !== (oldVal && oldVal.id)) {
                            // 销毁已经存在的 cropper
                            cropper && cropper.destroy();
                        }
                        // 如果新的数据中 cropper 开启 并且 之前不存在或     没有开启     或  切换了不同的 swipper
                        if (newVal && newVal.enable && (!oldVal || !oldVal.enable || newVal.id !== oldVal.id)) {
                            // cropper 则初始化
                            cropper = new Cropper(element[0], {
                                viewMode: 1,
                                dragMode: 'move',
                                data: scope.cropper.data || {}
                            });
                        }
                    }, true);
                    // 初始化、框选结束和缩放时保存框选数据
                    element.on('ready cropend zoom', function(e) {
                        // cropend、zoom 和首次 ready （通过 scope.cropper.data 为空判断，表明之前没有存储过，不是再次初始化）导致数据变化，对 scope 发出 cropchange 事件
                        if (e.type !== 'ready' || !scope.cropper.data) {
                            scope.$emit('cropchange');
                        }
                        scope.cropper.data = cropper && cropper.getData();
                    });
                }
            }
        }])

        // swiper 封装
        .directive('swiper', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                scope: {
                    swiper: '=swiper'
                },
                link: function(scope, element, attr) {
                    var defConf = {
                        navigation: {
                            nextEl: element.find('.swiper-button-next'),
                            prevEl: element.find('.swiper-button-prev'),
                        }
                    };
                    // 合并配置
                    if (scope.swiper) {
                        $.extend(defConf, scope.swiper);
                    }
                    // 初始化
                    var swiper = new Swiper(element, defConf);
                    // index 同步
                    // 滑动时发出事件
                    swiper.on('slideChange', function() {
                        scope.$emit('swiperSlideChange', swiper.activeIndex);
                    });
                    // 监听 index 变动，滚动至最后
                    attr.$observe('activeIndex', function(newVal, oldVal) {
                        var newValNum = ~~newVal;
                        if ((newVal !== oldVal) && (newValNum !== swiper.activeIndex)) {
                            $timeout(function() {
                                swiper.slideTo(newVal);
                            });
                        }
                    });
                }
            }
        }])

        // 通知
        .directive('notify', ['$rootScope', '$timeout', function($rootScope, $timeout) {
            var notifyList = [];
            return {
                restrict: 'AE',
                templateUrl: 'tpls/components/notify.html',
                scope: {
                    api: '=api'
                },
                replace: true,
                link: function(scope, element, attr) {
                    scope.notifyList = notifyList;
                    var $list = element.find('.notify-list');
                    var $item = $list.find('.notify-item');
                    // 删除原始节点
                    $item.remove();
                    scope.api = {
                        // 显示通知
                        open: function(conf) {
                            var that = this;
                            var defConf = {
                                id: UUID.generate(),
                                // 通知标题
                                title: 'Notify title',
                                // 通知内容
                                content: 'Notify content.',
                                // 样式类型
                                type: 'default',
                                // 历时
                                time: 5000,
                                // 延时显示
                                delay: 0
                            };
                            // 重新赋值
                            conf = (conf && typeof conf === 'object') ? conf : {};
                            defConf.title = conf.title ? conf.title : defConf.title;
                            defConf.content = conf.content ? conf.content : defConf.content;
                            var validType = ['default', 'success', 'info', 'warning', 'error'];
                            defConf.type = (conf.type && validType.indexOf(conf.type) !== -1) ? conf.type : defConf.type;
                            var classMap = {
                                default: 'fa-bell',
                                success: 'fa-check-circle',
                                info: 'fa-info-circle',
                                warning: 'fa-exclamation-circle',
                                error: 'fa-times-circle'
                            };
                            defConf.iconClass = classMap[defConf.type];
                            defConf.time = conf.time ? conf.time : defConf.time;
                            // 配置修改完成后，即添加到列表
                            scope.notifyList.push(defConf.id);
                            // 克隆节点
                            var $currentItem = $item.clone();
                            // 替换内部文本
                            $currentItem.attr('data-notify-id', defConf.id).html($currentItem.html().replace(/(&lt;%.+?%&gt;)|(<%.+?%>)/g, function(str) {
                                return defConf[str.replace(/(<%)|(%>)|(&lt;%)|(%&gt;)/g, '')];
                            }));
                            // 添加通知
                            $list.append($currentItem);
                            // 样式操作应在视图响应完毕后执行
                            $timeout(function() {
                                // 记录原始高度
                                var height = $currentItem.height();
                                // 高度置零
                                $currentItem.height(0);
                                // 为了产生 css 动画，必须分次修改高度，故放进 setTimeout
                                window.setTimeout(function() {
                                    // 高度还原
                                    $currentItem.height(height);
                                });
                                // 关闭倒计时
                                // 每秒帧数
                                var fps = 60;
                                // 播放每帧的速度
                                var speed = 1000 / 60;
                                // 每帧步长(总长 / 帧数)
                                var step = 100 / (defConf.time / 1000 * fps);
                                // 是否暂停
                                var paused = false;
                                // 鼠标移入暂停计时
                                $currentItem.on('mouseover', function() {
                                        paused = true;
                                    })
                                    .on('mouseleave', function() {
                                        paused = false;
                                    });
                                var $progress = $currentItem.find('.progress');
                                var length = 100;
                                var timer = window.setInterval(function() {
                                    // 未暂停时递减
                                    if (!paused) {
                                        length -= step;
                                        $progress.width(length + '%');
                                    }
                                    // 长度归零或节点已被移除时清除定时器
                                    if (length <= 0) {
                                        window.clearInterval(timer);
                                        // 节点还存在（没有被手动关闭）,进行关闭
                                        if ($currentItem.parent().length) {
                                            that.close(defConf.id);
                                        }
                                    }
                                }, speed);
                            });
                            // 关闭按钮事件绑定
                            $currentItem.find('button.close').on('click', function(e) {
                                that.close($(e.currentTarget).data('target-id'));
                            });
                        },
                        close: function(id) {
                            // 通过 id 查找要关闭的节点
                            var $currentItem = element.find('[data-notify-id="' + id + '"]');
                            // 添加游滑隐藏动画
                            $currentItem.find('.notify').addClass('in-close').on('transitionend', function(e) {
                                // 包裹层高度置零
                                $currentItem.on('transitionend', function(e) {
                                    if (e.target === $currentItem[0]) {
                                        // 过渡结束后删除
                                        $currentItem.remove();
                                        // 删除队列中的 id
                                        scope.notifyList.slice(scope.notifyList.indexOf(id), 1);
                                    }
                                }).height(0);
                            });

                        }
                    };
                }
            }
        }])

        // 业务组件：增值税人工干预
        .directive('vatCheck', ['NetSrv', 'Api', '$rootScope', '$timeout', function(NetSrv, Api, $rootScope, $timeout) {
            return {
                restrict: 'AE',
                templateUrl: 'tpls/components/vatCheck.html',
                replace: true,
                scope: {
                    data: '=data',
                    apiKey: '=apiKey'
                },
                link: function(scope, element, attr) {
                    // 人工干预参数
                    scope.checkParams = scope.data.result.mpRecognition.ocrInfoList ? scope.data.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.ocrData : {
                        invoiceType: '增值税专用发票',
                        invoiceCode: '',
                        invoiceNumber: '',
                        date: '',
                        checkCode: '',
                        totalPrice: ''
                    };
                    // 增值税验真人工干预
                    scope.manualIntervene = function(e) {
                        // 检查表单验证状态
                        if (scope.vatCheckForm.$invalid) {
                            return;
                        }
                        // 获取 APIKey，是
                        scope.checkParams.apiKey = scope.apiKey;
                        // 打开菊花圈
                        scope.loading = true;
                        NetSrv.ajaxFw({
                            url: Api.vatCheck,
                            params: scope.checkParams,
                            success: function(res) {
                                // 关闭菊花圈
                                scope.loading = false;
                                if (res.code && res.code === '00000' && res.result.resCode && res.result.resCode === '1') {
                                    // 弹出消息
                                    $rootScope.notify.open({
                                        title: '成功',
                                        content: '人工干预完成，识别结果已更新。',
                                        type: 'success'
                                    });
                                    // 用人工验真数据覆盖当前
                                    var replaceData = function() {
                                        $timeout(function() {
                                            scope.data.result.mpRecognition.resCd = res.code;
                                            scope.data.result.mpRecognition.resMsg = res.message;
                                            scope.data.result.mpRecognition.requestId = res.requestId;
                                            scope.data.result.mpRecognition.ocrInfoList = scope.data.result.mpRecognition.ocrInfoList ? scope.data.result.mpRecognition.ocrInfoList : {
                                                ocrInfo: {}
                                            };
                                            scope.data.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult = res.result;
                                        });
                                    };
                                    // 如果在模态框内，关闭所在模态框
                                    var $parentModal = element.parents('.modal');
                                    if ($parentModal.length) {
                                        $parentModal.on('hidden.bs.modal', function(e) {
                                            replaceData();
                                        }).modal('hide');
                                    } else {
                                        replaceData();
                                    }
                                } else {
                                    // 错误消息
                                    $rootScope.notify.open({
                                        title: '失败',
                                        content: (res.result && res.result.resCode) ? res.result.resMessage : res.message,
                                        type: 'error'
                                    });
                                }
                            },
                            headers: { 'X-Requested-With': undefined },
                            failAlert: true,
                            spinner: false
                        });
                    };
                }
            }
        }])

        // 业务组件：营业执照联网查询
        .directive('busLisQuery', ['NetSrv', 'Api', '$rootScope', '$timeout', function(NetSrv, Api, $rootScope, $timeout) {
            return {
                restrict: 'AE',
                templateUrl: 'tpls/components/busLisQuery.html',
                replace: true,
                scope: {
                    data: '=data'
                },
                link: function(scope, element, attr) {
                    var query = function(params) {
                        return NetSrv.ajaxFw({
                            url: Api.busLisQuery,
                            headers: {
                                'X-Requested-With': undefined
                            },
                            params: params,
                            success: function(res) {
                                scope.data.queryResult = res;
                            }
                        });
                    };
                    // 企业名称、统一社会信用代码、注册号取其一
                    Object.defineProperty(scope, 'entName', {
                        get: function() {
                            var entName = '';
                            var ocrResult = scope.data.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult;
                            entName = ocrResult.businessLicenseName || ocrResult.socialCreditCode || ocrResult.registrationNumber;
                            return entName;
                        }
                    });
                    // 直接点击按钮识别，传送来自 OCR 结果的企业名称 / 统一社会信用代码
                    scope.queryAfterOCR = function() {
                        scope.$parent.checkLogin().then(function(apiKey) {
                            query({
                                apiKey: apiKey,
                                entName: scope.entName
                            })
                        });
                    };
                    // 营业执照人工干预
                    scope.form = {};
                    scope.queryManual = function(e) {
                        // 检查表单验证状态
                        if (scope.form.busLisQueryForm.$invalid) {
                            return;
                        }
                        scope.loading = true;
                        scope.$parent.checkLogin().then(function(apiKey) {
                            query({
                                    apiKey: apiKey,
                                    entName: scope.entName
                                })
                                .then(function(res) {
                                    // 关菊花
                                    scope.loading = false;
                                    if (res.code && res.code === '00000') {
                                        // 弹出消息
                                        $rootScope.notify.open({
                                            title: '成功',
                                            content: '人工干预完成。',
                                            type: 'success'
                                        });
                                        // 如果有打开的模态框，关闭模态框再更新结果
                                        var $modal = element.find('.modal:visible');
                                        if ($modal.length) {
                                            $modal.on('hidden.bs.modal', function(e) {
                                                scope.data.queryResult = res;
                                            }).modal('hide');
                                        } else {
                                            scope.data.queryResult = res;
                                        }
                                    } else {
                                        // 错误消息
                                        $rootScope.notify.open({
                                            title: '失败',
                                            content: res.code ? res.message : '未知错误。',
                                            type: 'error'
                                        });
                                    }
                                })
                        });
                    };
                    // 字典
                    scope.trans = {
                        enterpriseName: '企业名称',
                        frName: '法人姓名',
                        regNo: '工商注册号',
                        creditCode: '统一社会信用代码',
                        regCap: '注册资金(单位:万元)',
                        regCapCur: '注册币种',
                        regOrg: '登记机关',
                        esDate: '开业日期',
                        openFrom: '经营期限自',
                        openTo: '经营期限至',
                        enterpriseType: '企业(机构)类型',
                        enterpriseStatus: '经营状态',
                        cancelDate: '注销日期',
                        revokeDate: '吊销日期',
                        orgCode: '组织机构代码',
                        operateScope: '经营(业务)范围',
                        apprDate: '核准时间',
                        address: '注册地址',
                        province: '省',
                        city: '地级市',
                        county: '区 / 县',
                        areaCode: '所在行政区划代码',
                        industryPhyCode: '行业门类代码',
                        industryPhyName: '行业门类名称',
                        industryCode: '国民经济行业代码',
                        industryName: '国民经济行业名称'
                    };
                }
            }
        }])

        // 区域菊花圈
        .directive('blockProgress', [function() {
            return {
                templateUrl: 'tpls/components/blockProgress.html',
                replace: true
            }
        }]);
})(window.angular);