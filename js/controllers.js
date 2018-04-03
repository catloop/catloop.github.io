(function(angular) {
    'use strict';
    var version = '1.0.19';
    var mpsCtrls = angular.module('mpsCtrls', [])

        .controller('mainCtrl', ['$scope', '$rootScope', '$window', function($scope, $rootScope, $window) {
            // 版本改变时清除 localStorage
            if (window.localStorage.getItem('version') !== version) {
                window.localStorage.clear();
                window.localStorage.setItem('version', version);
            }
            // 在 sessionStorage 产生 32 位随机码
            if (!$window.sessionStorage.getItem('visitorFlag')) {
                $window.sessionStorage.setItem('visitorFlag', Math.random().toString(36).substring(2));
            }
            $rootScope.docMode = false;
        }])

        .controller('indexCtrl', ['$scope', function($scope) {
            // $rootScope.docMode = false;
            // 配置轮播图切换时长
            $scope.$on('$viewContentLoaded', function() {
                $('.carousel').carousel({
                    interval: 5000
                })
            });

        }])

        .controller('loginCtrl', ['$scope', '$rootScope', '$http', '$element', '$window', 'Api', 'DataSrv', function($scope, $rootScope, $http, $element, $window, Api, DataSrv) {

            // 在 cookie 中设置 uuid
            if (!(/uuid\=/.test(document.cookie)) || !$window.localStorage.getItem('uuid')) {
                $window.localStorage.setItem('uuid', DataSrv.uuid());
                document.cookie = 'uuid=' + $window.localStorage.getItem('uuid');
            }

            // 获取登录状态
            var getLoginStatus = function() {
                $http({
                        method: 'POST',
                        url: Api.loginStatus,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        data: "token=" + ($window.localStorage.getItem('token') || '')
                    })
                    .then(function(res) {
                        if (res.data.status === "success") {
                            $scope.isLogin = true;
                            $scope.userName = res.data.userInfo.reqUserName;
                        }
                    })
                    .catch(function(err) {
                        if (err.status === 401) {
                            $scope.isLogin = false;
                            $scope.userName = '';
                        }
                    });
            };
            getLoginStatus();

            // 获取服务端参数配置
            var getSyaParams = function() {
                $http({
                        method: 'POST',
                        url: Api.sysParams,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        data: "token=" + ($window.localStorage.getItem('token') || '')
                    })
                    .then(function(res) {
                        if (res.data && res.data.code === 200) {
                            // 是否开启价格方案页面
                            $rootScope.payOpen = res.data.onlinePayFlag === 'Y';
                            // 是否开启助账宝
                            $rootScope.helpAccountOpen = res.data.accountantShowFlag === 'Y';
                        }
                    });
            };
            getSyaParams();

            var $hideForm = $element.find('#hideForm');

            // 设置隐藏表单的值
            $scope.uuidVal = $window.localStorage.getItem('uuid');

            // 手动触发表单的提交行为
            $scope.trigAct = function(target) {
                $scope.action = Api[target];
                $window.setTimeout(function() {
                    $hideForm.trigger('submit');
                });
            };

            // 登出
            $scope.logout = function() {
                $http({
                        method: 'POST',
                        url: Api.logout,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        data: "token=" + $window.localStorage.getItem('token')
                    })
                    .then(function(res) {
                        if (res.data.status === 'success') {
                            // 重新获取登录状态与服务配置参数
                            getLoginStatus();
                            getSyaParams();
                        }
                    });
            };
        }])

        .controller('overviewCtrl', ['$window', '$scope', function($window, $scope) {
            // 设置锚点
            $scope.setAnchor = function(anchor) {
                $window.sessionStorage.setItem('anchor', anchor);
            };
        }])

        .controller('demoCtrl', ['$scope', '$timeout', '$element', '$window', '$rootScope', '$state', 'Texts', function($scope, $timeout, $element, $window, $rootScope, $state, Texts) {

            // 描述文本
            var demoTexts = Texts.demoTexts;

            // 单张 / 批量，默认单张
            $scope.mode = 'single';

            $scope.$on('$viewContentLoaded', function() {
                // 更新描述文本
                $scope.demoText = demoTexts[$state.current.name];
                // 营业执照开启版面选择
                $scope.allowTemplateSel = ($state.current.name === 'demo.busLis');
                // 增值税发票和营业执照开启识别域配置
                $scope.allowFieldConf = ($state.current.name === 'demo.vat' || $state.current.name === 'demo.busLis');
                // state 判断
                $scope.isFace = ($state.current.name === 'demo.face');
                $scope.isIdCard = ($state.current.name === 'demo.idCard');
                $scope.isCreditCard = ($state.current.name === 'demo.creditCard');
                $scope.isVat = ($state.current.name === 'demo.vat');
                $scope.isFinSta = ($state.current.name === 'demo.finSta');
                $scope.isBusLis = ($state.current.name === 'demo.busLis');
                $scope.isFullText = ($state.current.name === 'demo.fullText');
                $scope.isSilentLive = ($state.current.name === 'demo.silentLive');
                $scope.isHelpAccount = ($state.current.name === 'demo.helpAccount');
                // 特定状态下不开启批量（人脸，全文识别）
                $scope.allowModeSel = !($scope.isFace || $scope.isFullText || $scope.isSilentLive || $scope.isHelpAccount);

            });

        }])

        .controller('demoFaceCtrl', ['$scope', '$rootScope', '$window', '$timeout', '$element', 'FileSrv', '$http', 'Api', 'NetSrv', 'UI', 'Texts', function($scope, $rootScope, $window, $timeout, $element, FileSrv, $http, Api, NetSrv, UI, Texts) {
            // 示例图片与模板
            $scope.sampleUrl = Texts.sampleUrl.face;

            // 数据列表
            $scope.dataList = [
                [],
                []
            ];

            // 选定的图片索引
            $scope.activeIndex = [-1, -1];

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 两个文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 比对程序
            var compare = function() {
                // 队列为空不执行
                if (!$scope.dataList[0].length || !$scope.dataList[1].length) {
                    return;
                }
                // 事务特征，两个文件的文件名、大小、修改时间
                var feature = {
                        imgName1: $scope.dataList[0][$scope.activeIndex[0]].originFile.name,
                        imgSize1: $scope.dataList[0][$scope.activeIndex[0]].originFile.size,
                        imgTime1: $scope.dataList[0][$scope.activeIndex[0]].originFile.lastModified,
                        imgName2: $scope.dataList[1][$scope.activeIndex[1]].originFile.name,
                        imgSize2: $scope.dataList[1][$scope.activeIndex[1]].originFile.size,
                        imgTime2: $scope.dataList[1][$scope.activeIndex[1]].originFile.lastModified
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 两个文件对比过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                        // 用于显示结果
                        $scope.isLoading = false;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }
                    // 用于隐藏结果
                    $scope.isLoading = true;
                    // 创建 formData
                    var formData = new FormData();
                    formData.append('visitorFlag', $window.sessionStorage.getItem('visitorFlag'));
                    formData.append('imgFile', $scope.dataList[0][$scope.activeIndex[0]].file);
                    formData.append('imgFile', $scope.dataList[1][$scope.activeIndex[1]].file);
                    // Request
                    NetSrv.ajaxFw({
                        url: Api.face,
                        data: formData,
                        headers: { 'Content-Type': undefined },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 返回相似度可能性的文字描述
            Object.defineProperty($scope, 'simiDesc', {
                get: function() {
                    // 根据 result 值计算
                    if ($scope.result && $scope.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.ucScore) {
                        var simiPoint = ~~($scope.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.ucScore * 100);
                        if (simiPoint >= 90) {
                            return '可能性很高';
                        } else if (simiPoint < 90 && simiPoint >= 80) {
                            return '可能性高';
                        } else if (simiPoint < 80 && simiPoint >= 30) {
                            return '可能性低';
                        } else if (simiPoint < 30) {
                            return '可能性很低';
                        }
                    }
                }
            });

            // 文件改变时添加数据
            $scope.fileChanged = function(ele, index) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件类型为图片时才处理
                if (!(/^image\/\w+$/g.test(ele.files[0].type))) {
                    return
                };
                // 当前项数据
                var currentData = {
                    originFile: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };
                // 压缩图片
                FileSrv.imgCompress({
                        file: ele.files[0],
                        maxPix: 4915200, // 500w
                        maxByte: 1048576, // 1M
                        cpsRatio: 0.7
                    })
                    .then(function(cpsFile) {
                        currentData.file = cpsFile;

                        // 往列表添加数据
                        if ($scope.dataList[index].length < 5) {
                            // 列表长度小于 5 添加
                            $scope.dataList[index].push(currentData);
                            $scope.activeIndex[index] = $scope.dataList[index].length - 1;
                        } else {
                            // 否则替换当前选定的
                            $scope.dataList[index][$scope.activeIndex[index]] = currentData;
                        }
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 同步 view
                        $scope.$apply('dataList');
                        compare();

                        // 接收压缩的图片转为 base64
                        /*FileSrv.file2base64(cpsFile)
                            .then(function(res) {
                                currentData.base64 = res;
                                // 往列表添加数据
                                if ($scope.dataList[index].length < 5) {
                                    // 列表长度小于 5 添加
                                    $scope.dataList[index].push(currentData);
                                    $scope.activeIndex[index] = $scope.dataList[index].length - 1;
                                } else {
                                    // 否则替换当前选定的
                                    $scope.dataList[index][$scope.activeIndex[index]] = currentData;
                                }
                                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                                ele.value = '';
                                // 同步 view
                                $scope.$apply('dataList');
                                compare();
                            });*/
                    });
            };

            // 选择的图片改变时执行比对
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    compare();
                }
            }, true);

        }])

        .controller('demoIdCardCtrl', ['$scope', '$window', 'Api', 'FileSrv', 'NetSrv', '$http', 'UI', 'Texts', function($scope, $window, Api, FileSrv, NetSrv, $http, UI, Texts) {
            // 示例图片与内容模板
            $scope.sampleUrl = Texts.sampleUrl.idCard;

            // 数据解析器模板
            $scope.resolver = Texts.resolver.idCard;

            // 属性名翻译文本
            $scope.trans = Texts.trans.idCard;

            // 数据列表
            $scope.dataList = [];

            // 选定的图片索引
            $scope.activeIndex = -1;

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 识别程序
            var reco = function() {
                // 队列为空则不执行
                if (!$scope.dataList.length) {
                    return;
                }
                // 事务特征，文件的文件名、大小、修改时间
                var feature = {
                        imgName: $scope.dataList[$scope.activeIndex].file.name,
                        imgSize: $scope.dataList[$scope.activeIndex].file.size,
                        imgTime: $scope.dataList[$scope.activeIndex].file.lastModified,
                        region: $scope.region.value
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 文件识别过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }

                    // 创建 formData
                    var formData = new FormData();
                    formData.append('visitorFlag', $window.sessionStorage.getItem('visitorFlag'));
                    formData.append('imgFile', $scope.dataList[$scope.activeIndex].file);
                    formData.append('region', $scope.region.value);

                    // Request
                    NetSrv.ajaxFw({
                        url: Api.idCard,
                        data: formData,
                        headers: { 'Content-Type': undefined },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件类型合格才进行处理
                if (!(/^image\/\w+$/g.test(ele.files[0].type))) {
                    return
                };
                // 当前项数据
                var currentData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };

                // 往列表添加数据
                if ($scope.dataList.length < 5) {
                    // 列表长度小于 5 添加
                    $scope.dataList.push(currentData);
                    $scope.activeIndex = $scope.dataList.length - 1;
                } else {
                    // 否则替换当前选定的
                    $scope.dataList[$scope.activeIndex] = currentData;
                }
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
                // 执行识别
                reco();
                // 同步 view
                $scope.$apply('dataList');

                /*// 图片转为 base64
                FileSrv.file2base64(ele.files[0])
                    .then(function(res) {
                        currentData.base64 = res;
                        // 往列表添加数据
                        if ($scope.dataList.length < 5) {
                            // 列表长度小于 5 添加
                            $scope.dataList.push(currentData);
                            $scope.activeIndex = $scope.dataList.length - 1;
                        } else {
                            // 否则替换当前选定的
                            $scope.dataList[$scope.activeIndex] = currentData;
                        }
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 执行识别
                        reco();
                        // 同步 view
                        $scope.$apply('dataList');
                    });*/
            };

            // 选择的图片改变时执行识别
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    reco();
                }
            });

            // 配置身份证类型
            $scope.region = {
                list: [{
                    name: '内地居民二代证',
                    value: 'CN'
                }, {
                    name: '香港居民身份证',
                    value: 'HK'
                }],
                value: 'CN'
            };

        }])

        .controller('demoCreditCardCtrl', ['$scope', '$window', 'Api', 'FileSrv', 'NetSrv', '$http', 'UI', 'Texts', '$timeout', function($scope, $window, Api, FileSrv, NetSrv, $http, UI, Texts, $timeout) {
            // 示例图片与内容模板
            $scope.sampleUrl = Texts.sampleUrl.creditCard;

            // 数据解析器模板
            $scope.resolver = Texts.resolver.creditCard;

            // 属性名翻译文本
            $scope.trans = Texts.trans.creditCard;

            // 数据列表
            $scope.dataList = [];

            // 选定的图片索引
            $scope.activeIndex = -1;

            // 避免在局部作用域内修改 activeIndex 导致不生效
            $scope.changeActive = function(index) {
                $scope.activeIndex = index;
            };

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 识别程序
            var reco = function() {
                // 队列为空则不执行
                if (!$scope.dataList.length) {
                    return;
                }
                // 事务特征，文件的文件名、大小、修改时间
                var feature = {
                        imgName: $scope.dataList[$scope.activeIndex].file.name,
                        imgSize: $scope.dataList[$scope.activeIndex].file.size,
                        imgTime: $scope.dataList[$scope.activeIndex].file.lastModified
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 文件识别过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }

                    // 创建 formData
                    var formData = new FormData();
                    formData.append('visitorFlag', $window.sessionStorage.getItem('visitorFlag'));
                    formData.append('imgFile', $scope.dataList[$scope.activeIndex].file);

                    // Request
                    NetSrv.ajaxFw({
                        url: Api.creditCard,
                        data: formData,
                        headers: { 'Content-Type': undefined },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return;
                };
                // 文件类型合格才进行处理
                if (!(/^image\/\w+$/g.test(ele.files[0].type))) {
                    return;
                };
                // 当前项数据
                var currentData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };

                // 往列表添加数据
                if ($scope.dataList.length < 5) {
                    // 列表长度小于 5 添加
                    $scope.dataList.push(currentData);
                    $scope.activeIndex = $scope.dataList.length - 1;
                } else {
                    // 否则替换当前选定的
                    $scope.dataList[$scope.activeIndex] = currentData;
                }
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
                // 执行识别
                reco();
                // 同步 view
                $scope.$apply('dataList');

                /*// 图片转为 base64
                FileSrv.file2base64(ele.files[0])
                    .then(function(res) {
                        currentData.base64 = res;
                        // 往列表添加数据
                        if ($scope.dataList.length < 5) {
                            // 列表长度小于 5 添加
                            $scope.dataList.push(currentData);
                            $scope.activeIndex = $scope.dataList.length - 1;
                        } else {
                            // 否则替换当前选定的
                            $scope.dataList[$scope.activeIndex] = currentData;
                        }
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 执行识别
                        reco();
                        // 同步 view
                        $scope.$apply('dataList');
                    });*/
            };

            // 选择的图片改变时执行识别
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    reco();
                }
            });

        }])

        .controller('demoVatCtrl', ['$scope', '$window', 'Api', 'Texts', 'FileSrv', 'NetSrv', 'DataSrv', '$http', 'UI', function($scope, $window, Api, Texts, FileSrv, NetSrv, DataSrv, $http, UI) {

            // 示例图片与内容模板
            $scope.sampleUrl = Texts.sampleUrl.vat;

            // 数据解析器模板
            $scope.resolver = Texts.resolver.vat;

            // 属性名翻译文本
            $scope.trans = Texts.trans.vat;

            // 数据列表
            $scope.dataList = [];

            // 选定的图片索引
            $scope.activeIndex = -1;

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                console.log(cacheData);
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 识别程序
            var reco = function() {
                // 队列为空则不执行
                if (!$scope.dataList.length) {
                    return;
                }
                // 事务特征，文件的文件名、大小、修改时间
                var feature = {
                        imgName: $scope.dataList[$scope.activeIndex].file.name,
                        imgSize: $scope.dataList[$scope.activeIndex].file.size,
                        imgTime: $scope.dataList[$scope.activeIndex].file.lastModified,
                        openField: openField()
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 文件识别过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }
                    // Request
                    NetSrv.ajaxFw({
                        url: Api.vat,
                        data: FileSrv.formData({
                            imgFile: $scope.dataList[$scope.activeIndex].file,
                            visitorFlag: $window.sessionStorage.getItem('visitorFlag'),
                            openField: openField()
                        }),
                        headers: {
                            'Content-Type': undefined
                        },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件类型合格才进行处理
                // if (!(/^image\/\w+$/g.test(ele.files[0].type))) {
                if (!ele.files.length || !(/(image)|(pdf)/g.test(ele.files[0].type))) {
                    return
                };
                // 当前项数据
                var currentData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };
                // 图片转为 base64
                FileSrv.file2base64(ele.files[0])
                    .then(function(res) {
                        currentData.base64 = res;
                        // 往列表添加数据
                        if ($scope.dataList.length < 5) {
                            // 列表长度小于 5 添加
                            $scope.dataList.push(currentData);
                            $scope.activeIndex = $scope.dataList.length - 1;
                        } else {
                            // 否则替换当前选定的
                            $scope.dataList[$scope.activeIndex] = currentData;
                        }
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 执行识别
                        reco();
                        // 同步 view
                        $scope.$apply('dataList');
                    });
            };

            // 选择的图片改变时执行识别
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    reco();
                }
            });

            // 过滤 key，结果中的部分 key 不应显示
            $scope.keyEnable = function(key) {
                var filtList = [
                    'detail', // 明细域单独显示
                    'RecMethod', // 识别方式，不显示
                    'Result' // 识别状态
                ];
                return filtList.indexOf(key) === -1;
            }

            /* 配置识别域 */
            // 获取识别域配置
            $scope.fields = Texts.getConfig();

            // 保存识别域配置
            $scope.saveConfig = function() {
                // $window.localStorage.setItem('vatFields', JSON.stringify($scope.fields));
                Texts.saveConfig($scope.fields);
            };

            // 输出已勾选的参数
            var openField = function() {
                return Texts.openField($scope.fields);
            };

            $scope.$watch('fields', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    var isEmpty = true;
                    for (var k in newVal) {
                        if (newVal[k].display && newVal[k].checked) {
                            isEmpty = false;
                        }
                    }
                    $scope.saveDisabled = isEmpty;
                }
            }, true);

        }])

        .controller('demoFinStaCtrl', ['$scope', '$window', 'Api', 'FileSrv', 'NetSrv', 'DataSrv', '$http', 'UI', 'Texts', function($scope, $window, Api, FileSrv, NetSrv, DataSrv, $http, UI, Texts) {
            // 示例图片与内容模板
            $scope.sampleUrl = Texts.sampleUrl.finSta;

            // 数据解析器模板
            $scope.resolver = Texts.resolver.finSta;

            // 属性名翻译文本
            $scope.trans = Texts.trans.finSta;

            // 数据列表
            $scope.dataList = [];

            // 选定的图片索引
            $scope.activeIndex = -1;

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 识别程序
            var reco = function() {
                // 队列为空则不执行
                if (!$scope.dataList.length) {
                    return;
                }
                // 事务特征，文件的文件名、大小、修改时间
                var feature = {
                        imgName: $scope.dataList[$scope.activeIndex].file.name,
                        imgSize: $scope.dataList[$scope.activeIndex].file.size,
                        imgTime: $scope.dataList[$scope.activeIndex].file.lastModified
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 文件识别过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }

                    // 创建 formData
                    var formData = new FormData();

                    // Request
                    NetSrv.ajaxFw({
                        url: Api.finSta,
                        data: FileSrv.formData({
                            visitorFlag: $window.sessionStorage.getItem('visitorFlag'),
                            imgFile: $scope.dataList[$scope.activeIndex].file
                        }),
                        headers: {
                            'Content-Type': undefined
                        },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 文件类型合格才进行处理
                // if (!ele.files.length || !(/image/g.test(ele.files[0].type))) {
                if (!ele.files.length || !(/(image)|(pdf)/g.test(ele.files[0].type))) {
                    return
                };
                // 当前项数据
                var currentData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };
                // 图片转为 base64
                FileSrv.file2base64(ele.files[0])
                    .then(function(res) {
                        currentData.base64 = res;
                        // 往列表添加数据
                        if ($scope.dataList.length < 5) {
                            // 列表长度小于 5 添加
                            $scope.dataList.push(currentData);
                            $scope.activeIndex = $scope.dataList.length - 1;
                        } else {
                            // 否则替换当前选定的
                            $scope.dataList[$scope.activeIndex] = currentData;
                        }
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 执行识别
                        reco();
                        // 同步 view
                        $scope.$apply('dataList');
                    });
            };

            // 选择的图片改变时执行识别
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    reco();
                }
            });

        }])

        .controller('demoBusLisCtrl', ['$scope', '$window', 'Api', 'Texts', 'FileSrv', 'NetSrv', 'DataSrv', '$http', 'UI', function($scope, $window, Api, Texts, FileSrv, NetSrv, DataSrv, $http, UI) {
            /**
             * 在当前作用域下定义一个 getter 属性，用于动态获取对应 template 的数据
             * @param  {String}         propName 此 getter 的属性名
             * @param  {Array / Object} target 以 template 为依据分类各组数据的集合
             */
            var createGetter = function(propName, target) {
                Object.defineProperty($scope, propName, {
                    get: function() {
                        return target[$scope.tplIndex];
                    },
                    set: function(val) {
                        target[$scope.tplIndex] = val;
                    }
                })
            };

            // template 值列表
            $scope.template = [{
                name: '新版营业执照',
                value: 12002
            }, {
                name: '企业法人',
                value: 12003
            }, {
                name: '个体工商户',
                value: 12004
            }];

            // 选定 template 的下标
            $scope.tplIndex = 0;

            // 示例图片与内容模板
            createGetter('sampleUrl', Texts.sampleUrl.busLis); // $scope.sampleUrl

            // 数据解析器模板
            $scope.resolver = Texts.resolver.busLis;

            // 属性名翻译文本
            $scope.trans = Texts.trans.busLis;

            // 以 template 区分的数据列表集合
            var allDataLists = [
                [],
                [],
                []
            ];
            // 主要数据列表
            createGetter('dataList', allDataLists); // $scope.dataList

            // 以 template 区分的选定索引集合
            var allActiveIndex = [];
            // 激活队列的下标
            createGetter('activeIndex', allActiveIndex); // $scope.activeIndex

            // 以 template 区分的结果集合
            var allResults = [];
            // 结果
            createGetter('result', allResults); // $scope.result

            // 以 template 区分的失败状态集合
            var allFaileds = [];
            // 失败
            createGetter('failed', allFaileds); // $scope.failed

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 识别程序
            var reco = function() {
                // 队列为空则不执行
                if (!$scope.dataList.length) {
                    return;
                }
                // 事务特征，文件的文件名、大小、修改时间
                var feature = {
                        imgName: $scope.dataList[$scope.activeIndex].file.name,
                        imgSize: $scope.dataList[$scope.activeIndex].file.size,
                        imgTime: $scope.dataList[$scope.activeIndex].file.lastModified,
                        template: $scope.template[$scope.tplIndex].value,
                        openField: openField()
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 文件识别过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }
                    // Request
                    NetSrv.ajaxFw({
                        url: Api.busLis,
                        data: FileSrv.formData({
                            visitorFlag: $window.sessionStorage.getItem('visitorFlag'),
                            template: $scope.template[$scope.tplIndex].value,
                            imgFile: $scope.dataList[$scope.activeIndex].file,
                            openField: openField()
                        }),
                        headers: {
                            'Content-Type': undefined
                        },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return;
                };
                // 文件类型合格才进行处理
                if (!(/^image\/\w+$/g.test(ele.files[0].type))) {
                    return;
                };
                // 当前项数据
                var currentData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };

                // 往列表添加数据
                if ($scope.dataList.length < 5) {
                    // 列表长度小于 5 添加
                    $scope.dataList.push(currentData);
                    $scope.activeIndex = $scope.dataList.length - 1;
                } else {
                    // 否则替换当前选定的
                    $scope.dataList[$scope.activeIndex] = currentData;
                }
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
                // 执行识别
                reco();
                // 同步 view
                $scope.$apply('dataList[tplIndex]');

                /*// 图片转为 base64
                FileSrv.file2base64(ele.files[0])
                    .then(function(res) {
                        currentData.base64 = res;
                        // 往列表添加数据
                        if ($scope.dataList.length < 5) {
                            // 列表长度小于 5 添加
                            $scope.dataList.push(currentData);
                            $scope.activeIndex = $scope.dataList.length - 1;
                        } else {
                            // 否则替换当前选定的
                            $scope.dataList[$scope.activeIndex] = currentData;
                        }
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 执行识别
                        reco();
                        // 同步 view
                        $scope.$apply('dataList[tplIndex]');
                    });*/
            };

            // 选择的图片改变时执行识别
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    reco();
                }
            }, true);


            /* 配置识别域 */

            // 获取识别域配置
            $scope.fields = Texts.getConfig();

            // 保存识别域配置
            $scope.saveConfig = function() {
                Texts.saveConfig($scope.fields);
            };

            // 输出已勾选的参数
            function openField() {
                return Texts.openField($scope.fields, $scope.template[$scope.tplIndex].value);
            };

            // 监听变化
            $scope.$watch('fields[template[tplIndex].value]', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    var isEmpty = true;
                    for (var k in newVal) {
                        if (newVal[k].display && newVal[k].checked) {
                            isEmpty = false;
                        }
                    }
                    $scope.saveDisabled = isEmpty;
                }
            }, true);

        }])

        .controller('demoFullTextCtrl', ['$scope', 'NetSrv', 'Api', 'FileSrv', '$window', 'Texts', function($scope, NetSrv, Api, FileSrv, $window, Texts) {
            // 示例图片与内容模板
            $scope.sampleUrl = Texts.sampleUrl.fullText;

            // 数据解析器模板
            $scope.resolver = Texts.resolver.fullText;

            // 数据列表
            $scope.dataList = [];

            // 选定的图片索引
            $scope.activeIndex = -1;

            // 坐标是否开启
            $scope.coordinate = false;

            // 识别类型
            $scope.iTypes = [{
                name: '其它',
                value: '0'
            }, {
                name: '财务报表识别',
                value: '1'
            }, {
                name: '简历识别',
                value: '2'
            }];
            $scope.iType = $scope.iTypes[0];

            // 结果数据缓存表
            var cacheData = {};

            /**
             * 数据处理程序
             * @param  {Object} res     结果数据
             * @param  {String} actHash 文件的特征值混合 hash
             */
            var branch = function(res, actHash) {
                console.log(cacheData);
                $scope.result = res;
                // 事务状态判断
                $scope.failed = !(res.mpRecognition.resCd === '00000');
                // 参数存在则将本次结果添加到缓存
                if (actHash) {
                    cacheData[actHash] = res;
                }
            };

            // 开关标记，为 true 则允许发送请求，用于限制数据监听与文件改变时的重复请求
            var allowRequest = true;

            // 识别程序
            var reco = function() {
                // 队列为空则不执行
                if (!$scope.dataList.length) {
                    return;
                }
                // 事务特征，文件的文件名、大小、修改时间
                var feature = {
                        imgName: $scope.dataList[$scope.activeIndex].file.name,
                        imgSize: $scope.dataList[$scope.activeIndex].file.size,
                        imgTime: $scope.dataList[$scope.activeIndex].file.lastModified,
                        coordinate: $scope.coordinate,
                        iType: $scope.iType.value
                    },
                    // 特征 hash 值
                    actHash = md5(JSON.stringify(feature));
                if (cacheData[actHash]) {
                    // 文件识别过，则取缓存中的数据
                    branch(cacheData[actHash]);
                } else {
                    // 未对比过则发请求，并将此次事务添加到缓存
                    var processor = function(res) {
                        /* 数据前处理 */
                        // 结果列表存在继续
                        if (res.mpRecognition.ocrInfoList) {
                            // 记录此次请求是否开启坐标的状态，用于控制模板中坐标相关区域是否显示
                            res.mpRecognition.ocrInfoList.ocrInfo.coordinate = $scope.coordinate;
                            // 根据是否开启坐标判断是否解析结果，关闭时输出纯文本，开启时输出可解析为对象的 JSON 字符串
                            if ($scope.coordinate && $scope.dataList[$scope.activeIndex].file.type.split('/')[0] === 'image') { // (pdf 也不处理！)
                                var ocrResult = res.mpRecognition.ocrInfoList.ocrInfo.ocrResult;
                                // 遍历对象,ocrResult 的值是 {"TextResult": "...", "TableResult": "..."}
                                for (var k in ocrResult) {
                                    // 只匹配 TextResult 和 TableResult，为了跳过 Angular 添加的标记 id 属性
                                    if (['TextResult', 'TableResult'].indexOf(k) !== -1) {
                                        try {
                                            // 尝试进一步将 JSON 字符串解析为数组，空字符串解析为空数组，避免报错
                                            ocrResult[k] = JSON.parse(ocrResult[k] || '[]')
                                        } catch (err) {
                                            console.log(err)
                                        }
                                    }
                                }
                                res.mpRecognition.ocrInfoList.ocrInfo.ocrResult = ocrResult;
                            }

                        }
                        branch(res, actHash);
                        // 一次请求发送成功后解锁请求
                        allowRequest = true;
                    };
                    // 阻止重复请求
                    if (!allowRequest) {
                        return;
                    }
                    // Request
                    NetSrv.ajaxFw({
                        url: Api.fullText,
                        data: FileSrv.formData({
                            myfile: $scope.dataList[$scope.activeIndex].file,
                            coordinate: $scope.coordinate ? '1' : '0',
                            iType: $scope.iType.value,
                            visitorFlag: $window.sessionStorage.getItem('visitorFlag')
                        }),
                        headers: {
                            'Content-Type': undefined
                        },
                        processor: processor,
                        fail: processor,
                        failAlert: true
                    });
                    // 结束之前锁定重复请求
                    allowRequest = false;
                }
            };

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件、且为图片或 pdf 才进行处理
                if (!ele.files.length || !(/(image)|(pdf)/g.test(ele.files[0].type))) {
                    return
                };
                // 当前项数据
                var currentData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0])
                };
                // 往列表添加数据
                if ($scope.dataList.length < 5) {
                    // 列表长度小于 5 添加
                    $scope.dataList.push(currentData);
                    $scope.activeIndex = $scope.dataList.length - 1;
                } else {
                    // 否则替换当前选定的
                    $scope.dataList[$scope.activeIndex] = currentData;
                }
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
                // 执行识别
                reco();
                // 同步 view
                $scope.$apply('dataList');
            };

            // 选择的图片改变时执行识别
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    reco();
                }
            });

        }])

        .controller('solutionHelpAccountCtrl', ['$scope', 'Texts', '$window', 'Api', 'DataSrv', 'UI', 'NetSrv', function($scope, Texts, $window, Api, DataSrv, UI, NetSrv) {
            // 阻止下拉菜单点击自动关闭
            window.setTimeout(function() {
                $('#helpAccount .config-field li').click(function(e) {
                    e.stopPropagation();
                })
            });

            // 数据解析器模板
            $scope.resolver = Texts.resolver.helpAccount;

            /* 配置识别域 */
            // 获取识别域配置
            $scope.fields = Texts.getConfig();
            $scope.$watch('fields', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $window.localStorage.setItem('helpAccountVatFields', JSON.stringify($scope.fields));
                }
            }, true);

            // 输出已勾选的参数
            Object.defineProperty($scope, 'openFieldStr', {
                get: function() {
                    return Texts.openField($scope.fields);
                }
            });

            var ws = null;

            function createWS(sequence) {
                // 创建 WebSocket
                ws = new WebSocket(Api.helpAccountQueryWS);
                ws.onopen = function(e) {
                    console.log('Sequence ' + sequence + ' start.');
                    ws.send(JSON.stringify({ sequence: sequence }));
                };
                ws.onmessage = function(e) {
                    var data = JSON.parse(e.data);
                    // 添加数据
                    $scope.allData[sequence].results[data.mpRecognition.serialNumber] = data;
                    // 更新识别时间
                    $scope.allData[sequence].recElapsed = Date.now() - $scope.allData[sequence].time;
                    $scope.$apply('overviewRow');
                    $scope.$apply('data');
                    // 完成时关闭连接
                    $scope.currentState.finished && ws.close();
                };
                ws.onclose = function(e) {
                    console.log('Sequence ' + sequence + ' over.');
                };
            }

            // 所有数据
            $scope.allData = {};
            // 成功数据
            Object.defineProperty($scope, 'successData', {
                get: function() {
                    var successData = {};
                    for (var k in $scope.allData) {
                        var sequence = {
                            files: {},
                            srcs: {},
                            results: {}
                        };
                        var sequenceStr = JSON.stringify(sequence);
                        for (var j in $scope.allData[k].results) {
                            /*try {
                                // 不包含空字符串则添加
                                if (!/\"\"/g.test(JSON.stringify($scope.allData[k].results[j].mpRecognition.ocrInfoList.ocrInfo.ocrResult))) {
                                    sequence.results[j] = $scope.allData[k].results[j];
                                    sequence.srcs[j] = $scope.allData[k].srcs[j];
                                    sequence.files[j] = $scope.allData[k].files[j];
                                }
                            } catch(e) {

                            }*/
                            if (!$scope.allData[k].results[j].mpRecognition.toHandle) {
                                sequence.results[j] = $scope.allData[k].results[j];
                                sequence.srcs[j] = $scope.allData[k].srcs[j];
                                sequence.files[j] = $scope.allData[k].files[j];
                            }
                        }
                        if (JSON.stringify(sequence) !== sequenceStr) {
                            sequence.time = $scope.allData[k].time;
                            sequence.uploadElapsed = $scope.allData[k].uploadElapsed;
                            sequence.recElapsed = $scope.allData[k].recElapsed;
                            successData[k] = sequence;
                        }
                    }
                    return successData;
                }
            });
            // 失败数据
            Object.defineProperty($scope, 'failedData', {
                get: function() {
                    var failedData = {};
                    for (var k in $scope.allData) {
                        var sequence = {
                            files: {},
                            srcs: {},
                            results: {}
                        };
                        var sequenceStr = JSON.stringify(sequence);
                        for (var j in $scope.allData[k].results) {
                            if ($scope.allData[k].results[j].mpRecognition.toHandle) {
                                sequence.results[j] = $scope.allData[k].results[j];
                                sequence.srcs[j] = $scope.allData[k].srcs[j];
                                sequence.files[j] = $scope.allData[k].files[j];
                            }
                        }
                        if (JSON.stringify(sequence) !== sequenceStr) {
                            sequence.time = $scope.allData[k].time;
                            sequence.uploadElapsed = $scope.allData[k].uploadElapsed;
                            sequence.recElapsed = $scope.allData[k].recElapsed;
                            failedData[k] = sequence;
                        }
                    }
                    return failedData;
                }
            });

            // 转换为字符串后相等
            $scope.strEqual = function(obj1, obj2) {
                return JSON.stringify(obj1) === JSON.stringify(obj2);
            }

            // 正在查看的数据
            $scope.data = $scope.allData;
            // 当前视图
            var currentViews = ['upload-rec', 'batch-query-success', 'sin-query-success', 'batch-query-failed', 'sin-query-failed'];
            $scope.currentView = 'upload-rec';

            // 当前浏览的数据组，可能是一组事务（sequence），也可能是通过筛选器组合的数据
            $scope.currentGroup = {};

            // 当前正在上传的事务号
            $scope.currentSequence = '';

            // 输出当前数据组的切换操作相关计算属性
            var currentSerialNumber = '';
            $scope.groupComputed = {
                // 内部数据为数组形式的 currentGroup
                get currentGroupArray() {
                    var currentGroupArray = {};
                    for (var k in $scope.currentGroup) {
                        if (k === 'results' || k === 'files' || k === 'srcs') {
                            currentGroupArray[k] = [];
                        } else {
                            currentGroupArray[k] = $scope.currentGroup[k];
                        }
                    }
                    for (var k in $scope.currentGroup.files) {
                        currentGroupArray.files.push($scope.currentGroup.files[k]);
                        currentGroupArray.results.push($scope.currentGroup.results[k]);
                        currentGroupArray.srcs.push($scope.currentGroup.srcs[k]);
                    }
                    return currentGroupArray;
                },
                // 当前正在查看的索引
                get activeIndex() {
                    var activeIndex = 0;
                    // 存在并且在 currentGroup 中，遍历查找
                    if (currentSerialNumber && $scope.currentGroup.files[currentSerialNumber]) {
                        for (var k in $scope.currentGroup.files) {
                            if (currentSerialNumber === k) {
                                break;
                            }
                            activeIndex++;
                        }
                    }
                    return activeIndex;
                },
                // 数据组长度
                get groupLength() {
                    var groupLength = 0;
                    for (var k in $scope.currentGroup.files) {
                        groupLength++;
                    }
                    return groupLength;
                },
                // 在开头
                get atFirst() {
                    return this.activeIndex === 0;
                },
                // 在结尾
                get atLast() {
                    return this.activeIndex === this.groupLength - 1;
                },
                // 通过 index 得到 key
                get indexMapProp() {
                    var indexMapProp = [];
                    for (var k in $scope.currentGroup.files) {
                        indexMapProp.push(k);
                    }
                    return indexMapProp;
                },
                // 通过 key 得到 index
                get propMapIndex() {
                    var propMapIndex = {};
                    for (var i = 0; i < this.indexMapProp.length; i++) {
                        propMapIndex[this.indexMapProp[i]] = i;
                    }
                    return propMapIndex;
                },
                // 去上一张
                toPrev: function() {
                    if (!this.atFirst) {
                        this.currentSerialNumber = this.indexMapProp[this.activeIndex - 1];
                    }
                },
                // 去下一张
                toNext: function() {
                    if (!this.atLast) {
                        this.currentSerialNumber = this.indexMapProp[this.activeIndex + 1];
                    }
                },
                // 可见队列（模态框预览图下方可见的最多三张图片）
                get visibleImgs() {
                    var visibleImgs = {};
                    if (this.groupLength < 3) {
                        return $scope.currentGroup.srcs;
                    }
                    if (this.atFirst) {
                        // 在开头，是 [0], [1], [2]
                        visibleImgs[this.indexMapProp[0]] = $scope.currentGroup.srcs[this.indexMapProp[0]];
                        visibleImgs[this.indexMapProp[1]] = $scope.currentGroup.srcs[this.indexMapProp[1]];
                        visibleImgs[this.indexMapProp[2]] = $scope.currentGroup.srcs[this.indexMapProp[2]];
                    } else if (this.atLast) {
                        // 在结尾，是 [groupLength - 3], [groupLength - 2], [groupLength - 1]
                        visibleImgs[this.indexMapProp[this.groupLength - 3]] = $scope.currentGroup.srcs[this.indexMapProp[this.groupLength - 3]];
                        visibleImgs[this.indexMapProp[this.groupLength - 2]] = $scope.currentGroup.srcs[this.indexMapProp[this.groupLength - 2]];
                        visibleImgs[this.indexMapProp[this.groupLength - 1]] = $scope.currentGroup.srcs[this.indexMapProp[this.groupLength - 1]];
                    } else {
                        // 正常情况是 [activeIndex - 1], [activeIndex], [activeIndex + 1]
                        visibleImgs[this.indexMapProp[this.activeIndex - 1]] = $scope.currentGroup.srcs[this.indexMapProp[this.activeIndex - 1]];
                        visibleImgs[this.indexMapProp[this.activeIndex]] = $scope.currentGroup.srcs[this.indexMapProp[this.activeIndex]];
                        visibleImgs[this.indexMapProp[this.activeIndex + 1]] = $scope.currentGroup.srcs[this.indexMapProp[this.activeIndex + 1]];

                    }
                    return visibleImgs;
                },
                // 当前正在查看的单次事务号
                get currentSerialNumber() {
                    // 如果不存在或在 currentGroup 中找不到，则赋值为首个
                    if (!currentSerialNumber || !$scope.currentGroup.files[currentSerialNumber]) {
                        for (var k in $scope.currentGroup.files) {
                            currentSerialNumber = k;
                            break;
                        }
                    }
                    return currentSerialNumber;
                },
                set currentSerialNumber(val) {
                    currentSerialNumber = val;
                }
            };

            // 输出扁平化的识别结果键值对
            Object.defineProperty($scope, 'flatOcrResult', {
                get: function() {
                    try {
                        return DataSrv.dataFlat($scope.currentGroup.results[$scope.groupComputed.currentSerialNumber].mpRecognition.ocrInfoList.ocrInfo.ocrResult, true);
                    } catch (e) {
                        return {};
                    }
                },
                set: function(val) {
                    console.log(val);
                }
            });
            $scope.ocrResultFlating = function(result) {
                try {
                    return DataSrv.dataFlat(result.mpRecognition.ocrInfoList.ocrInfo.ocrResult, true);
                } catch (e) {
                    return {};
                }
                // 输出扁平化的自信度键值对
            };
            Object.defineProperty($scope, 'flatOcrConfidence', {
                get: function() {
                    try {
                        return DataSrv.dataFlat($scope.currentGroup.results[$scope.groupComputed.currentSerialNumber].mpRecognition.ocrInfoList.ocrInfo.ocrConfidence);
                    } catch (e) {
                        return {};
                    }
                }
            });
            $scope.ocrConfidenceFlating = function(result) {
                try {
                    return DataSrv.dataFlat(result.mpRecognition.ocrInfoList.ocrInfo.ocrResult);
                } catch (e) {
                    return {};
                }
            };

            // 从 merge 的 currentGroup 筛选发票号码
            $scope.NOFilter = '';
            $scope.filt = function() {
                $scope.changeCurrentGroup.merge();
                var currentGroup = {
                    files: {},
                    srcs: {},
                    results: {}
                };
                for (var k in $scope.currentGroup.results) {
                    if ($scope.ocrResultFlating($scope.currentGroup.results[k]).InvoiceNumber && $scope.ocrResultFlating($scope.currentGroup.results[k]).InvoiceNumber.indexOf($scope.NOFilter) !== -1) {
                        currentGroup.files[k] = $scope.currentGroup.files[k];
                        currentGroup.srcs[k] = $scope.currentGroup.srcs[k];
                        currentGroup.results[k] = $scope.currentGroup.results[k];
                    }
                }
                $scope.currentGroup = currentGroup;
            };

            $scope.changeCurrentGroup = {
                // 选择一个事务
                bySequence: function(sequence) {
                    $scope.currentGroup = $scope.data[sequence];
                },
                // 合并所有事务到 currentGroup
                merge: function() {
                    var currentGroup = {
                        files: {},
                        srcs: {},
                        results: {}
                    };
                    for (var k in $scope.data) {
                        for (var j in $scope.data[k].results) {
                            currentGroup.files[j] = $scope.data[k].files[j];
                            currentGroup.srcs[j] = $scope.data[k].srcs[j];
                            currentGroup.results[j] = $scope.data[k].results[j];
                        }
                    }
                    $scope.currentGroup = currentGroup;
                }
            };

            // data 中是否上传过，作为结果视图是否显示的依据
            Object.defineProperty($scope, 'hasFile', {
                get: function() {
                    var hasFile = false;
                    for (var k in $scope.data) {
                        for (var j in $scope.data[k].files) {
                            hasFile = true
                        }
                    }
                    return hasFile;
                }
            });

            $scope.fileChanged = function(element) {
                var fileList = element.files;
                // 限制数量
                var maxLength = 20;
                var filesLength = fileList.length;
                var filesCount = 0;
                // 图片数量大于限定数量
                var gtMax = false;
                // 包含非图片
                var hasIvldFile = false;
                var files = {};
                while (filesLength--) {
                    // 文件数量大于 100，跳出循环
                    if (filesCount >= maxLength) {
                        gtMax = true;
                        break;
                    }
                    // 过滤非图片，添加图片到文件列表
                    if (/^image\/./.test(fileList[filesLength].type)) {
                        files[DataSrv.uuid()] = fileList[filesLength];
                        filesCount++;
                    } else {
                        // 包含非图片，修改标记
                        hasIvldFile = true;
                    }
                }
                var delay = 0;
                // 长度超过 100 ，提示
                if (gtMax) {
                    delay = 3000;
                    UI.toast('单次最多识别 ' + maxLength + ' 张图片', 3000);
                }
                // 包含非图片
                if (hasIvldFile) {
                    UI.toast('包含非图片，非图片将被过滤', 3000, delay);
                }
                // 无文件退出
                if (!filesCount) {
                    return;
                }

                // 创建事务编号
                $scope.currentSequence = DataSrv.uuid();
                var startTime = Date.now();
                $scope.data[$scope.currentSequence] = {
                    files: files,
                    results: {},
                    srcs: (function() {
                        var srcs = {};
                        for (var k in files) {
                            srcs[k] = window.URL.createObjectURL(files[k]);
                        }
                        return srcs;
                    })(),
                    time: startTime,
                    uploadElapsed: 0,
                    recElapsed: 0
                };
                createWS($scope.currentSequence);

                // 单次请求
                function singleRequest(key, cb) {
                    var formData = new FormData();

                    formData.append('visitorFlag', $window.sessionStorage.getItem('visitorFlag'));
                    formData.append('openField', $scope.openFieldStr);
                    formData.append('serialNumber', key);
                    formData.append('sequence', $scope.currentSequence);
                    formData.append('myfile', files[key]);

                    var p = new Promise(function(resolve, reject) {
                        NetSrv.ajaxFw({
                            url: Api.helpAccountCall,
                            headers: {
                                'Content-Type': undefined,
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            data: formData,
                            spinner: false,
                            processor: function(res) {
                                // 自增接收完成的图片数
                                $scope.currentState.receiveCount++;
                                // 更新上传时间
                                $scope.allData[$scope.currentSequence].uploadElapsed = Date.now() - $scope.data[$scope.currentSequence].time;
                                // 成功回调
                                resolve();
                            }
                        });

                    });

                    return p;
                }

                // 用来记录后续请求次数
                var requestCount = 0;
                for (var k in files) {
                    singleRequest(k)
                        .then(function() {
                            for (var j in files) {
                                // 略过第一次请求
                                if (requestCount) {
                                    singleRequest(j);
                                }
                                // 第一次请求略过后，自增使满足执行条件
                                requestCount++;
                            }
                        })
                        .catch(function(e) {
                            console.log(e);
                        })
                    // 第一个请求发出后中断循环
                    break;
                }

                // 清除文件列表
                element.value = '';
            }

            // 行统计
            $scope.overviewRow = {
                // 单次事务文件数量
                fileCount: function(row) {
                    var fileCount = 0;
                    if (row && row.files) {
                        for (var k in row.files) {
                            fileCount++;
                        }
                    }
                    return fileCount;
                },
                // 已识别数量
                finishCount: function(row) {
                    var finishCount = 0;
                    if (row && row.results) {
                        for (var k in row.results) {
                            if (row.results[k].mpRecognition) {
                                finishCount++;
                            }
                        }
                    }
                    return finishCount;
                },
                // 单次事务成功数
                successCount: function(row) {
                    return this.finishCount(row) - this.failedCount(row);
                },
                // 需人工识别数
                failedCount: function(row) {
                    var failedCount = 0;
                    for (var k in row.results) {
                        if (row.results[k].mpRecognition.toHandle) {
                            failedCount++;
                        }
                    }
                    return failedCount;
                },
                // 单次事务识别率
                successRate: function(row) {
                    var successCount = this.successCount(row);
                    var failedCount = this.failedCount(row);
                    return (successCount / (successCount + failedCount)) || 0;
                },
                // 识别时间
                createDate: function(row) {
                    return row.time;
                },
                // 图片总大小
                totalSize: function(row) {
                    var totalSize = 0;
                    for (var k in row.files) {
                        totalSize += row.files[k].size;
                    }
                    return totalSize;
                },
                // 上传时间
                uploadElapsed: function(row) {
                    return row.uploadElapsed;
                },
                // 识别时间
                recElapsed: function(row) {
                    return row.recElapsed
                }
            };

            // 当前事务状态
            $scope.currentState = {
                // 当前事务号
                get sequence() {
                    return $scope.currentSequence;
                },
                // 当前数据
                get data() {
                    return $scope.allData[this.sequence];
                },
                // 当前事务的文件数
                get fileCount() {
                    return $scope.overviewRow.fileCount(this.data);
                },
                // 当前事务文件累计大小
                get totalSize() {
                    return $scope.overviewRow.totalSize(this.data);
                },
                // 返回成功数
                get successCount() {
                    return $scope.overviewRow.successCount(this.data);
                },
                // 返回需人工干预数
                get failedCount() {
                    return $scope.overviewRow.failedCount(this.data);
                },
                // 返回成功率
                get successRate() {
                    return $scope.overviewRow.successRate(this.data);
                },
                _receiveCountMap: {},
                // 返回已接收文件数
                get receiveCount() {
                    if (this._receiveCountMap[this.sequence] === undefined) {
                        this._receiveCountMap[this.sequence] = 0;
                    }
                    return this._receiveCountMap[this.sequence];
                },
                set receiveCount(val) {
                    this._receiveCountMap[this.sequence] = val;
                },
                // 返回已识别文件数
                get finishCount() {
                    return $scope.overviewRow.finishCount(this.data);
                },
                // 获取上传耗时
                get uploadElapsed() {
                    return $scope.overviewRow.uploadElapsed(this.data);
                },
                // 获取格式化后的上传耗时
                get uploadElapsedFormat() {
                    return moment(new Date(moment().format('YYYY-MM-DD')).getTime() + this.uploadElapsed).format('mm′ss″');
                },
                // 获取识别耗时
                get recElapsed() {
                    return $scope.overviewRow.recElapsed(this.data);
                },
                // 获取格式化后的识别耗时
                get recElapsedFormat() {
                    return moment(new Date(moment().format('YYYY-MM-DD')).getTime() + this.recElapsed).format('mm′ss″');
                },
                // 是否完成
                get finished() {
                    return this.finishCount === this.fileCount;
                }
            };

        }])

        .controller('demoSilentLiveCtrl', ['$scope', '$window', 'NetSrv', 'Api', function($scope, $window, NetSrv, Api) {
            // 初始化数据
            $scope.data = {
                files: [],
                src: [],
                result: null,
                status: 0 // 0: 未识别; 1： 已识别
            };

            var addImg = function(file) {
                // 列表长度小于 3 往列表添加文件
                if ($scope.data.files.length < 3) {
                    $scope.data.files.push(file);
                    $scope.data.src.push($window.URL.createObjectURL(file));
                }
                // 刷新 vm
                $scope.$apply('data');
            };

            // 相机取图时添加
            $scope.capture = function(file) {
                addImg(file);
            };

            // 文件改变时添加
            $scope.fileChanged = function(ele) {
                // 有文件、且为图片才进行处理
                if (!ele.files.length || !(/image\/\w+/g.test(ele.files[0].type))) {
                    return;
                };

                // 列表长度小于 3 往列表添加文件
                addImg(ele.files[0]);
            };

            $scope.resultMap = {
                '1': '攻击样本',
                '2': '活体'
            };

            // 成功回调
            var processor = function(res) {
                $scope.data.result = res;
                $scope.failed = false;
                // 改变状态为已识别
                $scope.data.status = 1;
            };

            // 失败回调
            var fail = function(res) {
                $scope.data.result = res;
                $scope.failed = true;
                // 改变状态为已识别
                $scope.data.status = 1;
            };

            // 识别请求发送
            $scope.reco = function() {
                // 生成 formData
                var formData = new FormData();
                formData.append('visitorFlag', $window.sessionStorage.getItem('visitorFlag'));
                formData.append('imgFiles', $scope.data.files[0]);
                formData.append('imgFiles', $scope.data.files[1]);
                formData.append('imgFiles', $scope.data.files[2]);

                NetSrv.ajaxFw({
                    url: Api.silentLive,
                    headers: {
                        'Content-Type': undefined,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    data: formData,
                    processor: processor,
                    fail: fail
                });
            };

            // 重置 vm 状态
            $scope.reset = function() {
                $scope.data.files.length = 0;
                $scope.data.src.length = 0;
                $scope.data.result = null;
                $scope.data.status = 0;
                $scope.failed = false;
            };

        }])

        .controller('demoBatchCtrl', ['$scope', '$rootScope', '$window', 'Api', 'UI', '$http', 'FileSrv', 'DataSrv', '$state', 'Texts', function($scope, $rootScope, $window, Api, UI, $http, FileSrv, DataSrv, $state, Texts) {
            // 状态名
            var fullStateName = $state.current.name,
                stateName = fullStateName.substr(fullStateName.indexOf('.') + 1);

            // 服务类型参数集
            var serviceType = {
                'face': '7',
                'idCard': '3',
                'creditCard': '2',
                'vat': '5',
                'finSta': '6',
                'busLis': '4'
            };

            // 解析器
            $scope.resolver = Texts.rsvBatch[stateName];

            // 翻译文本
            $scope.trans = Texts.trans[stateName];


            // 数据列表
            $scope.dataList = [];
            $scope.activeIndex = 0;
            // 状态
            $scope.isLoading = false;
            $scope.isSingleView = false;
            $scope.isAdd = false;

            // 最多上传的图片数量
            var maxLength = 4;

            // 识别域属性名
            var watchStr = 'fields';

            // 在营业执照状态下数据分 template 存储，需要切换机制
            if ($scope.$parent.isBusLis) {
                console.log($scope);
                /**
                 * 在当前作用域下定义一个 getter 属性，用于动态获取对应 template 的数据
                 * @param  {String}         propName 此 getter 的属性名
                 * @param  {Array / Object} target 以 template 为依据分类各组数据的集合
                 */
                var createGetter = function(propName, target) {
                    Object.defineProperty($scope, propName, {
                        get: function() {
                            return target[$scope.tplIndex];
                        },
                        set: function(val) {
                            target[$scope.tplIndex] = val;
                        }
                    })
                };

                // template 值列表
                $scope.template = [{
                    name: '新版营业执照',
                    value: 12002
                }, {
                    name: '企业法人',
                    value: 12003
                }, {
                    name: '个体工商户',
                    value: 12004
                }];

                // 选定 template 的下标
                $scope.tplIndex = 0;

                // 切换 template
                $scope.changeTpl = function(index) {
                    $scope.tplIndex = index;
                    // 关闭单张查看，以免数据不同步
                    $scope.isSingleView = false;
                };

                // 以 template 区分的数据列表集合
                var allDataLists = [
                    [],
                    [],
                    []
                ];
                // 主要数据列表
                createGetter('dataList', allDataLists); // $scope.dataList

                // 以 template 区分的选定索引集合
                var allActiveIndex = [];
                // 激活队列的下标
                createGetter('activeIndex', allActiveIndex); // $scope.activeIndex

                // 修改识别域属性名
                watchStr = 'fields[template[tplIndex].value]';
            }

            /* 身份证类型选择 */
            $scope.region = {
                list: [{
                    name: '内地居民二代证',
                    value: 'CN'
                }, {
                    name: '香港居民二代证',
                    value: 'HK'
                }],
                value: 'CN'
            };

            /* 识别域配置 */
            // 获取识别域配置
            $scope.fields = Texts.getConfig();

            // 保存识别域配置
            $scope.saveConfig = function() {
                Texts.saveConfig($scope.fields);
            };

            // 输出已勾选的参数
            var openField = function() {
                return Texts.openField($scope.fields, ($scope.tplIndex === 0 || $scope.tplIndex) ? $scope.template[$scope.tplIndex].value : null);
            };

            // 监听识别域变化，为空时不能保存
            $scope.$watch(watchStr, function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    var isEmpty = true;
                    for (var k in newVal) {
                        if (newVal[k].display && newVal[k].checked) {
                            isEmpty = false;
                        }
                    }
                    $scope.saveDisabled = isEmpty;
                }
            }, true);

            // 允许的文件类型
            $scope.acceptFileTypes = ['image/gif', 'image/jpeg', 'image/png'];
            // 如果是增值税，增加 PDF
            if ($scope.$parent.$parent.isVat) {
                $scope.acceptFileTypes.push('application/pdf');
            }
            // 文件改变时触发
            $scope.fileChanged = function(ele) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };

                // 文件类型不是图片停止
                for (var i = 0; i < ele.files.length; i++) {
                    if ($scope.acceptFileTypes.indexOf(ele.files[i].type) === -1) {
                        return;
                    }
                }

                // 添加文件列表到数组使其能够被操作
                var fileList = [];
                Array.prototype.push.apply(fileList, ele.files);

                // 长度超过 4 ，截取前四张
                if (ele.files.length > maxLength) {
                    fileList = fileList.slice(0, maxLength);
                    UI.toast('单次最多识别 ' + maxLength + ' 张图片', 5000);
                }

                // 当前数据构造器
                var CurrentData = function(fileArr) {
                    // 文件列表
                    this.files = fileArr;

                    // 缩略图列表
                    var thumbs = [];
                    for (var i = 0; i < fileArr.length; i++) {
                        thumbs.push(window.URL.createObjectURL(fileArr[i]));
                    }
                    this.thumbs = thumbs;

                    // 子指示器下标
                    this.activeIndex = fileArr.length - 1;

                    // 取批量结果数据的公共 key(作为表头)
                    Object.defineProperty(this, 'commonTh', {
                        get: function() {
                            var tmpArr = [];
                            // 只有在结果存在且有数据时才进行动作
                            if (!this.result || !this.result.mpRecognition.ocrInfoList || !this.result.mpRecognition.ocrInfoList.length) {
                                return tmpArr;
                            }
                            var ocrInfoList = this.result.mpRecognition.ocrInfoList;
                            var length = ocrInfoList.length;
                            while (length--) {
                                var pushKey = function(res) {
                                    for (var k in res) {
                                        if (tmpArr.indexOf(k) === -1) {
                                            tmpArr.push(k);
                                        }
                                    }
                                }
                                var ocrResults = ocrInfoList[length].ocrInfo.ocrResult;
                                /* 如果 ocrResult 是数组，需要多一层遍历*/
                                if (ocrResults && ocrResults.length) {
                                    var resLen = ocrResults.length;
                                    while (resLen--) {
                                        var ocrResult = ocrResults[resLen] || {};
                                        pushKey(ocrResult)
                                    }
                                } else {
                                    pushKey(ocrResults)
                                }
                            }
                            return tmpArr;
                        }
                    });
                };

                // 当前数据实例
                var currentData = new CurrentData(fileList);

                // 长度在 5 以内添加，为 5 覆盖
                if ($scope.dataList.length > 4) {
                    $scope.dataList[$scope.activeIndex] = currentData;
                } else {
                    $scope.dataList.push(currentData);
                    $scope.activeIndex = $scope.dataList.length - 1;
                }

                upload(fileList);

                // 刷 vm
                $scope.$apply('dataList');

                // 清除文件列表
                ele.value = '';
            };

            // 过滤增值税的 key，结果中的部分 key 不应显示
            $scope.vatKeyEnable = function(key) {
                var filtList = [
                    'detail', // 明细域单独显示
                    'RecMethod', // 识别方式，不显示
                    'Result' // 识别状态
                ];
                return filtList.indexOf(key) === -1;
            }

            $scope.addImg = function(ele) {
                // 未选退出
                if (!ele.files.length) {
                    return
                };

                // 文件类型不是图片停止
                for (var i = 0; i < ele.files.length; i++) {
                    // if (!(/image\/\w+/g.test(ele.files[i].type))) {
                    if ($scope.acceptFileTypes.indexOf(ele.files[i].type) === -1) {
                        return;
                    }
                }

                // 设置 add 状态，用以和创建区分
                $scope.isAdd = true;

                // 还可添加的数量
                var maxAdd = maxLength - $scope.dataList[$scope.activeIndex].files.length;

                // 移动 FileList 实例对象到数组用以截取
                var fileList = [];
                Array.prototype.push.apply(fileList, ele.files);

                // 长度超过可添加数量，自动截取
                if (ele.files.length > maxAdd) {
                    fileList = fileList.slice(0, maxAdd);
                    UI.toast('此次最多可添加 ' + maxAdd + ' 张图片', 5000);
                }

                // 将本次添加的文件推至队列
                Array.prototype.push.apply($scope.dataList[$scope.activeIndex].files, fileList);
                // 添加预览图
                var thumbs = [];
                for (var i = 0; i < fileList.length; i++) {
                    thumbs.push($window.URL.createObjectURL(fileList[i]));
                }
                Array.prototype.push.apply($scope.dataList[$scope.activeIndex].thumbs, thumbs);

                // 选定到最后添加的项
                $scope.dataList[$scope.activeIndex].activeIndex = $scope.dataList[$scope.activeIndex].files.length - 1;

                // 调用通用上传方法
                upload(fileList)
                    .then(function() {
                        // 成功后重置添加状态
                        $scope.isAdd = false;
                    });

                // 清除文件列表
                ele.value = '';

                // 刷新 vm
                $scope.$apply('dataList');
            };

            // 切换为单个视图
            $scope.toSingleView = function() {
                $scope.isSingleView = true;
            };

            // 切换为总览视图
            $scope.toPandect = function() {
                $scope.isSingleView = false;
            };

            // 删除图片
            $scope.delete = function(subIndex) {
                // 移除文件
                $scope.dataList[$scope.activeIndex].files.splice(subIndex, 1);
                // 移除缩略图
                $scope.dataList[$scope.activeIndex].thumbs.splice(subIndex, 1);
                // 移除结果
                $scope.dataList[$scope.activeIndex].result.mpRecognition.ocrInfoList.splice(subIndex, 1);
                // 退出单图模式
                $scope.isSingleView = false;
                // 如果长度为空，删除此队列
                if (!$scope.dataList[$scope.activeIndex].files.length) {
                    $scope.dataList.splice($scope.activeIndex, 1);
                    if ($scope.activeIndex >= $scope.dataList.length) {
                        $scope.activeIndex = $scope.dataList.length - 1;
                    }
                    return;
                }
                // 修正选定
                if ($scope.dataList[$scope.activeIndex].activeIndex >= $scope.dataList[$scope.activeIndex].files.length) {
                    $scope.dataList[$scope.activeIndex].activeIndex = $scope.dataList[$scope.activeIndex].files.length - 1;
                }
            };

            /**
             * 批量识别通用 http 请求处理方法
             * @param  {Array} files    File 实例对象组成的数组
             * @return {Promise}        Promise 对象，处理 http 请求后的动作
             */
            function upload(files) {
                var data = {
                    serviceType: serviceType[stateName],
                    template: $scope.tplIndex !== undefined ? $scope.template[$scope.tplIndex].value : '',
                    responseType: 0,
                    sequence: DataSrv.uuid(),
                    visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                    openField: openField(),
                    region: $scope.region ? $scope.region.value : ''
                };

                var formData = new FormData();

                // 先添加字符串参数
                for (var k in data) {
                    formData.append(k, data[k]);
                }

                // 再添加文件列表
                for (var i = 0; i < files.length; i++) {
                    formData.append('imgFile', files[i]);
                }

                // 开启载入层
                $scope.isLoading = true;

                return ($http({
                        method: 'POST',
                        url: Api.batch,
                        transformRequest: angular.identity,
                        // 进度相关，暂不需要
                        /*uploadEventHandlers: {
                            progress: function(e) {
                                // 本次文件数量
                                $scope.totalCount = files.length;
                                // 已上传数量
                                var loadedCount = 0;
                                var fileSize = 0;
                                for (var i = 0; i < files.length; i++) {
                                    fileSize += files[i].size;
                                    if (fileSize < e.loaded) {
                                        loadedCount++;
                                    } else {
                                        break;
                                    }
                                }
                                $scope.loadedCount = loadedCount;
                            }
                        },*/
                        data: formData,
                        headers: { 'Content-Type': undefined }
                    })
                    .then(function(res) {
                            if ($scope.isAdd) {
                                // 当是在子视图添加图片时，将结果 push 到原来的数据而不新生成数据覆盖
                                Array.prototype.push.apply($scope.dataList[$scope.activeIndex].result.mpRecognition.ocrInfoList, res.data.mpRecognition.ocrInfoList);
                            } else {
                                // 全新添加则直接创建
                                $scope.dataList[$scope.activeIndex].result = res.data;
                            }

                            var ocrInfoList = $scope.dataList[$scope.activeIndex].result.mpRecognition.ocrInfoList;

                        },
                        function(err) {
                            UI.toast('请求失败，请检查网络连接。');
                        })
                    .then(function() {
                        $scope.isLoading = false;
                    })
                );
            }

        }])

        .controller('docCtrl', ['$window', '$location', '$rootScope', '$anchorScroll', function($window, $location, $rootScope, $anchorScroll) {
            // 跳转锚点，值是从 overview 服务形式设置来的
            var anchor = $window.sessionStorage.getItem('anchor');
            if (anchor) {
                $anchorScroll(anchor);
            }
            // 清空锚点值，避免来自其他页面也会跳锚点
            $window.sessionStorage.removeItem('anchor');
        }])

        .controller('priceCtrl', ['$scope', '$http', 'Api', function($scope, $http, Api) {
            $scope.current = {
                storageApiTab: 0,
                priceTab: 0
            };
            $scope.storageTrans = {
                '23': '存储空间（GB）',
                '3': '存储空间（月）'
            };
            $http.get(Api.price.feesPerTime)
                .then(function(res) {
                    if (res.status === 200 && res.data) {
                        $scope.perTime = res.data;
                    }
                });
            $http.get(Api.price.feesPerMonth)
                .then(function(res) {
                    if (res.status === 200 && res.data) {
                        $scope.perMonth = res.data;
                    }
                });
            $http.get(Api.price.feesPerYear)
                .then(function(res) {
                    if (res.status === 200 && res.data) {
                        $scope.perYear = res.data;
                    }
                });
            $http.get(Api.price.imageStorage)
                .then(function(res) {
                    if (res.status === 200 && res.data) {
                        $scope.imageStorage = res.data;
                    }
                });
        }])

        .controller('contactCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
            $scope.current = 0;
            // $rootScope.docMode = true;
        }]);
})(window.angular);