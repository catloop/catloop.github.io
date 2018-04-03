(function(angular) {
    'use strict';
    var routers = {};
    routers.index = {
        state: 'index',
        config: {
            url: '/',
            templateUrl: 'tpls/index.html',
            controller: 'indexCtrl'
        },
        title: '首页'
    };
    routers.overview = {
        state: 'overview',
        config: {
            url: '/overview',
            templateUrl: 'tpls/overview.html',
            controller: 'overviewCtrl'
        },
        title: '服务全览'
    };
    routers.demo = {
        state: 'demo',
        config: {
            url: '/demo',
            views: {
                '@': {
                    templateUrl: 'tpls/demo.html',
                    controller: 'demoCtrl'
                }
            }
        },
        title: '算法演示'
    };
    routers['demo.face'] = {
        state: 'demo.face',
        config: {
            url: '/face',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.face': {
                    templateUrl: 'tpls/demo/face.html',
                    controller: 'demoFaceCtrl'
                }
            }
        },
        title: '人脸比对'
    };
    routers['demo.idCard'] = {
        state: 'demo.idCard',
        config: {
            url: '/idCard',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.idCard': {
                    templateUrl: 'tpls/demo/idCard.html',
                    controller: 'demoIdCardCtrl'
                },
                'subViewBatch@demo.idCard': {
                    templateUrl: 'tpls/demo/Batch.html',
                    controller: 'demoBatchCtrl'
                }
            }
        },
        title: '身份证识别'
    };
    routers['demo.creditCard'] = {
        state: 'demo.creditCard',
        config: {
            url: '/creditCard',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.creditCard': {
                    templateUrl: 'tpls/demo/creditCard.html',
                    controller: 'demoCreditCardCtrl'
                },
                'subViewBatch@demo.creditCard': {
                    templateUrl: 'tpls/demo/Batch.html',
                    controller: 'demoBatchCtrl'
                }
            }
        },
        title: '银行卡识别'
    };
    routers['demo.vat'] = {
        state: 'demo.vat',
        config: {
            url: '/vat',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.vat': {
                    templateUrl: 'tpls/demo/vat.html',
                    controller: 'demoVatCtrl'
                },
                'subViewBatch@demo.vat': {
                    templateUrl: 'tpls/demo/Batch.html',
                    controller: 'demoBatchCtrl'
                }
            }
        },
        title: '增值税发票识别'
    };
    routers['demo.finSta'] = {
        state: 'demo.finSta',
        config: {
            url: '/finSta',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.finSta': {
                    templateUrl: 'tpls/demo/finSta.html',
                    controller: 'demoFinStaCtrl'
                },
                'subViewBatch@demo.finSta': {
                    templateUrl: 'tpls/demo/Batch.html',
                    controller: 'demoBatchCtrl'
                }
            }
        },
        title: '财务报表识别'
    };
    routers['demo.busLis'] = {
        state: 'demo.busLis',
        config: {
            url: '/busLis',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.busLis': {
                    templateUrl: 'tpls/demo/busLis.html',
                    controller: 'demoBusLisCtrl'
                },
                'subViewBatch@demo.busLis': {
                    templateUrl: 'tpls/demo/Batch.html',
                    controller: 'demoBatchCtrl'
                }
            }
        },
        title: '营业执照识别'
    };
    routers['demo.fullText'] = {
        state: 'demo.fullText',
        config: {
            url: '/fullText',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.fullText': {
                    templateUrl: 'tpls/demo/fullText.html',
                    controller: 'demoFullTextCtrl'
                }
            }
        },
        title: '全文字识别'
    };
    routers['demo.silentLive'] = {
        state: 'demo.silentLive',
        config: {
            url: '/silentLive',
            views: {
                '@': routers.demo.config.views['@'],
                'subView@demo.silentLive': {
                    templateUrl: 'tpls/demo/silentLive.html',
                    controller: 'demoSilentLiveCtrl'
                }
            }
        },
        title: '静默活体检测'
    };
    routers.solution = {
        state: 'solution',
        config: {
            url: '/solution',
            views: {
                '@': {
                    templateUrl: 'tpls/solution.html'
                }
            }
        },
        title: '行业方案'
    };
    routers['solution.helpAccount'] = {
        state: 'solution.helpAccount',
        config: {
            url: '/helpAccount',
            views: {
                '@': routers.solution.config.views['@'],
                'subView@solution.helpAccount': {
                    templateUrl: 'tpls/solution/helpAccount/index.html',
                    controller: 'solutionHelpAccountCtrl'
                }
            }
        },
        title: '助账宝'
    };
    routers.doc = {
        state: 'doc',
        config: {
            url: '/doc',
            templateUrl: 'tpls/doc.html',
            controller: 'docCtrl'
        },
        title: '开发接入'
    };
    routers.price = {
        state: 'price',
        config: {
            url: '/price',
            templateUrl: 'tpls/price.html',
            controller: 'priceCtrl'
        },
        title: '价格方案'
    };
    routers.accessGuide = {
        state: 'accessGuide',
        config: {
            url: '/accessGuide',
            templateUrl: 'tpls/accessGuide.html'
        },
        title: '接入指南'
    };
    routers.APIDoc = {
        state: 'APIDoc',
        config: {
            url: '/APIDoc',
            templateUrl: 'tpls/APIDoc.html'
        },
        title: 'API 文档'
    };
    routers.SDKDownload = {
        state: 'SDKDownload',
        config: {
            url: '/SDKDownload',
            templateUrl: 'tpls/SDKDownload.html'
        },
        title: 'SDK 下载'
    };
    routers.contact = {
        state: 'contact',
        config: {
            url: '/contact',
            templateUrl: 'tpls/contact.html',
            controller: 'contactCtrl'
        },
        title: '联系我们'
    };
    routers.FAQ = {
        state: 'FAQ',
        config: {
            url: '/FAQ',
            templateUrl: 'tpls/FAQ.html'
        },
        title: '常见问题'
    };
    var mpsApp = angular.module('mpsApp', ['ui.router', 'ui.router.state.events', 'mpsCtrls', 'mpsDirectives', 'mpsSrvs', 'mpsFilters', 'ngSanitize'])
        .config(['$urlRouterProvider', '$stateProvider', '$compileProvider', function($urlRouterProvider, $stateProvider, $compileProvider) {
            $stateProvider
                .state(routers.index.state, routers.index.config)
                .state(routers.overview.state, routers.overview.config)
                .state(routers.demo.state, routers.demo.config)
                .state(routers['demo.face'].state, routers['demo.face'].config)
                .state(routers['demo.idCard'].state, routers['demo.idCard'].config)
                .state(routers['demo.creditCard'].state, routers['demo.creditCard'].config)
                .state(routers['demo.vat'].state, routers['demo.vat'].config)
                .state(routers['demo.finSta'].state, routers['demo.finSta'].config)
                .state(routers['demo.busLis'].state, routers['demo.busLis'].config)
                .state(routers['demo.fullText'].state, routers['demo.fullText'].config)
                .state(routers['demo.silentLive'].state, routers['demo.silentLive'].config)
                .state(routers['solution'].state, routers['solution'].config)
                .state(routers['solution.helpAccount'].state, routers['solution.helpAccount'].config)
                .state(routers.doc.state, routers.doc.config)
                .state(routers.price.state, routers.price.config)
                .state(routers.accessGuide.state, routers.accessGuide.config)
                .state(routers.APIDoc.state, routers.APIDoc.config)
                .state(routers.SDKDownload.state, routers.SDKDownload.config)
                .state(routers.contact.state, routers.contact.config)
                .state(routers.FAQ.state, routers.FAQ.config);

            $urlRouterProvider
                .when('', '/')
                .otherwise('/');

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|fil‌​e|blob|ftp|mailto|ch‌​rome-extension):/);
        }])
        .run(['$rootScope', '$state', '$stateParams', '$window', '$location', '$anchorScroll', function($rootScope, $state, $stateParams, $window, $location, $anchorScroll) {
            $rootScope.routers = routers;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                // 算法演示默认人脸识别
                if ($state.current.name === 'demo') {
                    $state.go('demo.face');
                }
                // 行业方案默认助帐宝
                if ($state.current.name === 'solution') {
                    $state.go('solution.helpAccount');
                }
                // 修改标题，按“子页面 - 页面 - 微模式”格式拼接
                if ($state.current.name === 'index') {
                    $rootScope.title = "识验云 - 微模式";
                } else {
                    var strArr = [];
                    var propArr = $state.current.name.split('.');
                    var tmpArr = [];
                    for (var i = 0; i < propArr.length; i++) {
                        tmpArr.push(propArr[i]);
                        strArr.unshift(' - ');
                        strArr.unshift(routers[tmpArr.join('.')].title);
                    }
                    strArr.push('识验云 - 微模式');
                    $rootScope.title = strArr.join('');
                }
                // 跳到顶部，解决加载内容页面长度变化导致的位置变化
                if (!$window.sessionStorage.getItem('anchor')) {
                    $anchorScroll('main');
                }
            });
        }]);
})(window.angular);
