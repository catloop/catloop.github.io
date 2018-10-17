(function(angular) {
    'use strict';
    var version = '1.0.19';
    var mpsCtrls = angular.module('mpsCtrls', [])

        // 全局 controller
        .controller('mainCtrl', ['$scope', '$rootScope', '$window', function($scope, $rootScope, $window) {
            // 版本改变时清除 localStorage
            if (window.localStorage.getItem('version') !== version) {
                window.localStorage.clear();
                window.localStorage.setItem('version', version);
            }
            // 在 sessionStorage 产生 32 位随机码
            if (!window.sessionStorage.getItem('visitorFlag')) {
                window.sessionStorage.setItem('visitorFlag', Math.random().toString(36).substring(2));
            }
            $rootScope.docMode = false;
        }])

        // 首页
        .controller('indexCtrl', ['$scope', function($scope) {

        }])

        // 登录
        .controller('loginCtrl', ['$scope', '$rootScope', '$http', '$element', '$window', 'Api', function($scope, $rootScope, $http, $element, $window, Api) {

            // 在 cookie 中设置 uuid
            if (!(/uuid\=/.test(document.cookie)) || !window.localStorage.getItem('uuid')) {
                window.localStorage.setItem('uuid', UUID.generate());
                document.cookie = 'uuid=' + window.localStorage.getItem('uuid');
            }

            // 获取登录状态
            $rootScope.getLoginStatus = function() {
                var p = $http({
                    method: 'POST',
                    url: Api.loginStatus,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    params: { token: (window.localStorage.getItem('token') || '') }
                });
                p.then(function(res) {
                    if (res.data.status === "success") {
                        $rootScope.isLogin = true;
                        $rootScope.userName = res.data.userInfo.reqUserName;
                    }
                })
                p.catch(function(err) {
                    if (err.status === 401) {
                        $rootScope.isLogin = false;
                        $rootScope.userName = '';
                    }
                });
                return p;
            };
            $rootScope.getLoginStatus();

            // 获取服务端参数配置
            var getSyaParams = function() {
                $http({
                        method: 'POST',
                        url: Api.sysParams,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        data: "token=" + (window.localStorage.getItem('token') || '')
                    })
                    .then(function(res) {
                        if (res.data && res.data.code === 200) {
                            // 是否开启价格方案页面
                            $rootScope.payOpen = res.data.onlinePayFlag === 'Y';
                            // 是否开启助账宝
                            $rootScope.helpAccountOpen = res.data.accountantShowFlag === 'Y';
                            // 广播 $stateChangeSuccess，使导航指示器响应
                            $rootScope.$broadcast('$stateChangeSuccess');
                        }
                    });
            };
            getSyaParams();

            // 登出
            $scope.logout = function() {
                $http({
                        method: 'POST',
                        url: Api.logout,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        data: "token=" + window.localStorage.getItem('token')
                    })
                    .then(function(res) {
                        if (res.data.status === 'success') {
                            // 广播登录完成
                            $rootScope.$broadcast('logoutSuccess');
                            // 界面通知
                            $rootScope.notify.open({ title: '提示', content: '帐号已退出。', type: 'info' });
                            // 重新获取登录状态与服务配置参数
                            $rootScope.getLoginStatus();
                            getSyaParams();
                        }
                    });
            };
        }])

        // 服务全览
        .controller('overviewCtrl', ['$scope', '$state', function($scope, $state) {
            // 进入路由并跳转锚点
            $scope.goToAnchor = function(state, anchor) {
                $state.go(state, { anchor: anchor });
            };
        }])

        // 开发接入
        .controller('docCtrl', ['$timeout', '$anchorScroll', '$stateParams', function($timeout, $anchorScroll, $stateParams) {
            // 跳转锚点，值是从 overview 服务形式路由参数来的
            if ($stateParams.anchor) {
                $timeout(function() {
                    $anchorScroll($stateParams.anchor);
                });
            }
        }])

        // 算法演示
        .controller('demoCtrl', ['$scope', '$timeout', '$element', '$window', '$rootScope', '$state', 'Texts', function($scope, $timeout, $element, $window, $rootScope, $state, Texts) {

            // 描述文本
            var demoTexts = Texts.demoTexts;

            $scope.$on('$viewContentLoaded', function() {
                var stateName = $state.current.name.split('.')[1];
                // 更新描述文本
                $scope.demoText = stateName ? demoTexts[stateName] : null;
                // 示例图片、模板、解析路径
                $scope.path = stateName ? Texts.path[stateName] : null;
            });

            // swiper 配置
            $scope.swiper = {
                slidesPerView: 3,
                spaceBetween: 10,
                observer: true,
                observeParents: true,
                slideToClickedSlide: true,
                centeredSlides: true
            };
        }])

        // 人脸比对
        .controller('demoFaceCtrl', ['$scope', '$rootScope', '$timeout', '$element', 'FileSrv', '$http', 'Api', 'NetSrv', 'Texts', function($scope, $rootScope, $timeout, $element, FileSrv, $http, Api, NetSrv, Texts) {
            // 主要数据
            $scope.data = {
                origin: {
                    file: null,
                    src: null
                },
                contrast: {
                    file: null,
                    src: null
                },
                result: null,
                finished: false
            };

            // 比对程序
            $scope.compare = function() {
                var success = function(res) {
                    if (res) {
                        $scope.data.result = res;
                        $scope.data.finished = true;
                    }
                }
                // Request
                NetSrv.ajaxFw({
                    url: Api.face,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: [$scope.data.origin.file, $scope.data.contrast.file]
                    }),
                    headers: { 'Content-Type': undefined },
                    success: success,
                    failAlert: true
                });
            };

            // 返回相似度可能性的文字描述
            Object.defineProperty($scope, 'simiDesc', {
                get: function() {
                    // 根据 result 值计算
                    if (!$scope.data.result || !$scope.data.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.ucScore) {
                        return;
                    }
                    var simiPoint = ~~($scope.data.result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.ucScore * 100);
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
            });

            // 文件改变时添加数据
            $scope.fileChanged = function(ele, type) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 文件变化后，可进行识别
                $scope.data.finished = false;
                // 清空结果
                $scope.data.result = null;
                // 压缩图片
                FileSrv.imgCompress({
                        file: ele.files[0],
                        maxPix: 4915200, // 500w
                        maxByte: 1048576, // 1M
                        cpsRatio: 0.7
                    })
                    .then(function(cpsFile) {
                        // 设置数据
                        $scope.data[type] = {
                            file: cpsFile,
                            src: window.URL.createObjectURL(cpsFile)
                        };
                        // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                        ele.value = '';
                        // 同步 view
                        $scope.$apply('data');
                    });
            };
        }])

        // 身份证识别
        .controller('demoIdCardCtrl', ['$scope', 'Texts', function($scope, Texts) {
            // key 字典
            $scope.trans = Texts.trans.idCard;
            // 证件类型
            $scope.certType = 'CN';
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';
            // 过滤 key，结果中的部分 key 不应显示
            $scope.keyEnable = function(key) {
                var filtList = [
                    'idCardSide'
                ];
                return filtList.indexOf(key) === -1;
            };
        }])

        // 身份证单张
        .controller('demoIdCardCtrl.single', ['$scope', '$rootScope', 'Api', 'NetSrv', 'FileSrv', function($scope, $rootScope, Api, NetSrv, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    params: {
                        region: $scope.$parent.$parent.certType
                    },
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.idCard,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: $scope.dataList[$scope.activeIndex].file,
                        region: $scope.dataList[$scope.activeIndex].params.region,
                        dataFormat: 'simple'
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };

            // 选择的图片改变时恢复身份证类型的选择
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 读取身份证类型
                    $scope.$parent.$parent.certType = $scope.dataList[newVal].params.region;
                }
            });


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            })

        }])

        // 身份证批量
        .controller('demoIdCardCtrl.multiple', ['$scope', '$rootScope', 'Api', 'NetSrv', 'FileSrv', function($scope, $rootScope, Api, NetSrv, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.params = { region: $scope.$parent.$parent.certType };
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            var ocrResult = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult));
                            for (var k in ocrResult) {
                                if (commonTh.indexOf(k) === -1) {
                                    commonTh.push(k);
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.idCard,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file,
                                region: $scope.dataList[$scope.activeIndex.group].items[index].params.region,
                                dataFormat: 'simple'
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };

            // 选择的组或图片改变时恢复身份证类型的选择
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 读取身份证类型
                    $scope.$parent.$parent.certType = $scope.dataList[newVal.group].items[newVal.item].params.region;
                }
            }, true);


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            })
        }])

        // 银行卡识别
        .controller('demoCreditCardCtrl', ['$scope', 'Texts', function($scope, Texts) {
            // key 字典
            $scope.trans = Texts.trans.creditCard;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';
        }])

        // 银行卡单张
        .controller('demoCreditCardCtrl.single', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.creditCard,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: $scope.dataList[$scope.activeIndex].file,
                        dataFormat: 'simple'
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 银行卡批量
        .controller('demoCreditCardCtrl.multiple', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            var ocrResult = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult));
                            for (var k in ocrResult) {
                                if (commonTh.indexOf(k) === -1) {
                                    commonTh.push(k);
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.creditCard,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file,
                                dataFormat: 'simple'
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 增值税发票
        .controller('demoVatCtrl', ['$scope', '$rootScope', 'Api', 'Texts', 'FileSrv', 'NetSrv', '$http', function($scope, $rootScope, Api, Texts, FileSrv, NetSrv, $http) {
            // key 字典
            $scope.trans = Texts.trans.vat;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';

            // 过滤 key，结果中的部分 key 不应显示
            $scope.keyEnable = function(key) {
                var filtList = [
                    'detail', // 明细域单独显示
                    'RecMethod', // 识别方式，不显示
                    'Result' // 识别状态
                ];
                return filtList.indexOf(key) === -1;
            };

            // 识别模式，ocr: ocr； check: ocr + 验真
            $scope.ocrMode = 'ocr';

            var pendingAction;
            // 切换模式
            $scope.switchOcrMode = function(mode) {
                // ocr 模式直接切换
                var ocr = function() {
                    $scope.ocrMode = 'ocr';
                };
                // check 模式检查登录
                var check = function() {
                    // 已登录直接切换
                    if ($rootScope.isLogin) {
                        $scope.ocrMode = 'check';
                    } else {
                        // 未登录弹出提示，并打开登录框
                        $rootScope.notify.open({
                            title: '请登录',
                            content: '增值税验真需登录使用。',
                            type: 'info'
                        });
                        pendingAction = true;
                        $rootScope.showLogin = true;
                    }
                };
                // 不同模式执行对应操作
                var actions = {
                    ocr: ocr,
                    check: check
                };
                actions[mode]();
            };

            // 获取 ApiKey
            var getCheckKey = function() {
                var p = $http({
                    method: 'GET',
                    url: Api.getVatKey,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    params: {
                        token: window.localStorage.getItem('token')
                    }
                });
                p.then(function(res) {
                    if (res.data && res.data !== 'session_timeout' && res.data.apiKey) {
                        $scope.checkApiKey = res.data.apiKey;
                    } else {
                        $rootScope.notify.open({ title: '错误', content: '没有获取到 APIKey。', type: 'error' });
                    }
                });
                return p;
            };

            // 检测到登录后获取 APIKey
            $rootScope.getLoginStatus().then(function(res) {
                $rootScope.isLogin && getCheckKey();
            });

            // 登录成功时执行，当有未完成切换并登录成功时切换到验真模式
            $scope.$on('loginSuccess', function() {
                getCheckKey().then(function() {
                    $rootScope.showLogin = '';
                    if (pendingAction) {
                        $scope.ocrMode = 'check';
                        pendingAction = false;
                    }
                });
            });

            // 监听登出事件，登出时状态置回 OCR
            $scope.$on('logoutSuccess', function() {
                $scope.ocrMode = 'ocr';
            });

            /* 配置识别域 */
            // 获取识别域配置
            $scope.getConfig = function() {
                $scope.fields = Texts.fields.getConfig();
            };

            // 保存识别域配置
            $scope.saveConfig = function() {
                Texts.fields.saveConfig($scope.fields);
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

        // 增值税发票单张
        .controller('demoVatCtrl.single', ['$scope', '$rootScope', 'NetSrv', 'Api', 'Texts', 'FileSrv', function($scope, $rootScope, NetSrv, Api, Texts, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return;
                };
                // 文件类型合法才进行处理
                var mimeTypes = {
                    ocr: ['image/jpeg', 'image/png', 'image/bmp', 'application/pdf'],
                    check: ['image/jpeg', 'image/png', 'image/bmp']
                };
                // 文件不是合法类型弹出提示并停止
                if (mimeTypes[$scope.$parent.$parent.ocrMode].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    params: {
                        ocrMode: $scope.$parent.$parent.ocrMode
                    },
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 根据不同的识别类型发送不同的参数到不同的接口
                NetSrv.ajaxFw({
                    url: { ocr: Api.vat, check: Api.ocr }[$scope.$parent.$parent.ocrMode],
                    data: FileSrv.formData(({
                        ocr: {
                            imgFile: $scope.dataList[$scope.activeIndex].file,
                            visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                            openField: Texts.fields.openField()
                        },
                        check: {
                            apiKey: $scope.$parent.checkApiKey,
                            serviceType: 4002,
                            responseType: 0,
                            imgFile: $scope.dataList[$scope.activeIndex].file
                        }
                    })[$scope.$parent.$parent.ocrMode]),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };

            // 选择的图片改变时恢复识别类型的选择
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 读取识别类型
                    $scope.$parent.$parent.certType = $scope.dataList[newVal].params.ocrMode;
                }
            });


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 恢复 ocrMode 值
                $scope.$parent.$parent.ocrMode = $scope.dataList[index].params.ocrMode;
                // 触发脏检查
                $scope.$apply('dataList');
            });

            // 导出 Excel
            $scope.exportExcel = function() {
                window.open(Api.vat2Excel + '?requestIds=' + $scope.dataList[$scope.activeIndex].result.mpRecognition.requestId);
            };
        }])

        // 增值税发票批量
        .controller('demoVatCtrl.multiple', ['$scope', '$rootScope', 'NetSrv', 'Api', 'Texts', 'FileSrv', function($scope, $rootScope, NetSrv, Api, Texts, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.params = {
                    ocrMode: $scope.$parent.$parent.ocrMode
                };
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            // 验真与 OCR 分支
                            if ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.resCode) {
                                // 验真错误跳过
                                if ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.resCode !== '1' || !$scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.data) {
                                    continue;
                                }
                                var result = $scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.data;
                                for (var k in result) {
                                    if (commonTh.indexOf(k) === -1) {
                                        commonTh.push(k);
                                    }
                                }
                            }
                            // 结果遍历，公共 key
                            var resultData = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.data));
                            var resLength = resultData.length;
                            while (resLength--) {
                                for (var k in resultData[resLength]) {
                                    if (commonTh.indexOf(k) === -1) {
                                        commonTh.push(k);
                                    }
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 文件不是合法类型停止
                var mimeTypes = {
                    ocr: ['image/jpeg', 'image/png', 'image/bmp', 'application/pdf'],
                    check: ['image/jpeg', 'image/png', 'image/bmp']
                };
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                for (var i = 0; i < ele.files.length; i++) {
                    if (mimeTypes[$scope.$parent.$parent.ocrMode].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 根据不同的识别类型发送不同的参数到不同的接口
                        NetSrv.ajaxFw({
                            url: { ocr: Api.vat, check: Api.ocr }[$scope.$parent.$parent.ocrMode],
                            data: FileSrv.formData(({
                                ocr: {
                                    imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file,
                                    openField: Texts.fields.openField(),
                                    visitorFlag: window.sessionStorage.getItem('visitorFlag')
                                },
                                check: {
                                    apiKey: $scope.$parent.checkApiKey,
                                    serviceType: 4002,
                                    responseType: 0,
                                    imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file
                                }
                            })[$scope.$parent.$parent.ocrMode]),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };

            // 选择的组或图片改变时恢复识别类型的选择
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 读取识别类型
                    $scope.$parent.$parent.ocrMode = $scope.dataList[newVal.group].items[newVal.item].params.ocrMode;
                }
            }, true);


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            });

            // 导出 Excel
            $scope.exportExcel = {
                execute: function() {
                    var requestIds = [];
                    // 验证为识别成功后添加到数组
                    var validateAdd = function(data) {
                        if (data.mpRecognition.resCd === '00000') {
                            requestIds.push(data.mpRecognition.requestId);
                        }
                    };
                    ({
                        group: function() {
                            var length = $scope.dataList[$scope.activeIndex.group].items.length;
                            while (length--) {
                                validateAdd($scope.dataList[$scope.activeIndex.group].items[length].result);
                            }
                        },
                        item: function() {
                            validateAdd($scope.dataList[$scope.activeIndex.group].items[$scope.activeIndex.item].result);
                        }
                    })[$scope.viewMode]();
                    if (!requestIds.length) {

                    }
                    window.open(Api.vat2Excel + '?requestIds=' + requestIds.join(','));
                },
                // 允许导出，条件：组视图时包含成功结果，单条视图时本条成功
                get allow() {
                    return ({
                        group: function() {
                            var count = 0;
                            if (!$scope.dataList[$scope.activeIndex.group]) {
                                return count;
                            }
                            var length = $scope.dataList[$scope.activeIndex.group].items.length;
                            while (length--) {
                                // 结果不存在跳过
                                if (!$scope.dataList[$scope.activeIndex.group].items[length].result) {
                                    continue;
                                }
                                if ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd === '00000' &&
                                    ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.resCode ?
                                        $scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.resCode === '1' :
                                        true)) {
                                    count++;
                                }
                            }
                            return count;
                        },
                        item: function() {
                            return $scope.dataList[$scope.activeIndex.group].items[$scope.activeIndex.item].result.mpRecognition.resCd === '00000' &&
                                ($scope.dataList[$scope.activeIndex.group].items[$scope.activeIndex.item].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.resCode ?
                                    $scope.dataList[$scope.activeIndex.group].items[$scope.activeIndex.item].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.resCode === '1' :
                                    true);
                        }
                    })[$scope.viewMode]();
                }
            };
        }])

        // 财务报表是别
        .controller('demoFinStaCtrl', ['$scope', 'Api', 'FileSrv', 'NetSrv', 'Texts', function($scope, Api, FileSrv, NetSrv, Texts) {
            // key 字典
            $scope.trans = Texts.trans.finSta;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';
        }])

        // 财务报表单张
        .controller('demoFinStaCtrl.single', ['$scope', '$rootScope', 'Api', 'FileSrv', 'NetSrv', function($scope, $rootScope, Api, FileSrv, NetSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    id: UUID.generate(),
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.finSta,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: $scope.dataList[$scope.activeIndex].file
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 财务报表批量
        .controller('demoFinStaCtrl.multiple', ['$scope', '$rootScope', 'Api', 'FileSrv', 'NetSrv', function($scope, $rootScope, Api, FileSrv, NetSrv) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.id = UUID.generate();
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.finSta,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            })
        }])

        // 营业执照识别
        .controller('demoBusLisCtrl', ['$scope', '$rootScope', 'Api', 'Texts', '$http', 'NetSrv', function($scope, $rootScope, Api, Texts, $http, NetSrv) {
            // key 字典
            $scope.trans = Texts.trans.busLis;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';
            // template 值列表
            $scope.templates = {
                '12002': '新版营业执照',
                '12003': '企业法人',
                '12004': '个体工商户'
            };
            // 激活的版面
            $scope.activeTemplate = '12002';

            // 获取 ApiKey
            var getQueryKey = function() {
                var p = $http({
                    method: 'GET',
                    url: Api.getBusLisKey,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    params: {
                        token: window.localStorage.getItem('token')
                    }
                });
                p.then(function(res) {
                    if (res.data && res.data !== 'session_timeout' && res.data.apiKey) {
                        $scope.queryApiKey = res.data.apiKey;
                    } else {
                        $rootScope.notify.open({ title: '错误', content: '没有获取到 APIKey。', type: 'error' });
                    }
                });
                return p;
            };

            // 检测到登录后获取 APIKey
            $rootScope.getLoginStatus().then(function(res) {
                $rootScope.isLogin && getQueryKey();
            });

            // 查询前登录检查
            $scope.checkLogin = function(entName) {
                var checkLoginPromise = new Promise(function(resolve, reject) {
                    // 未登录弹出提示，并弹出登录框
                    if (!$rootScope.isLogin) {
                        $rootScope.notify.open({
                            title: '请登录',
                            content: '营业执照联网查询需登录使用。',
                            type: 'info'
                        });
                        $rootScope.showLogin = true;
                        // 登录成功时执行，关闭登录窗口，并执行查验
                        var loginSuccess = $scope.$on('loginSuccess', function() {
                            // 取消绑定
                            loginSuccess();
                            // 获取 APIKey 后关闭登录框，执行查询
                            getQueryKey().then(function() {
                                $rootScope.showLogin = '';
                                resolve && resolve($scope.queryApiKey);
                            });
                        });
                    } else {
                        // 已登录执行查询
                        resolve && resolve($scope.queryApiKey);
                    }
                });
                return checkLoginPromise;
            };

            /* 配置识别域 */
            // 获取识别域配置
            $scope.getConfig = function() {
                $scope.fields = Texts.fields.getConfig();
            };

            // 保存识别域配置
            $scope.saveConfig = function() {
                Texts.fields.saveConfig($scope.fields);
            };

            $scope.$watch('fields', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    var isEmpty = true;
                    var fields = newVal[$scope.activeTemplate];
                    for (var k in fields) {
                        if (fields[k].display && fields[k].checked) {
                            isEmpty = false;
                        }
                    }
                    $scope.saveDisabled = isEmpty;
                }
            }, true);
        }])

        .controller('demoBusLisCtrl.single', ['$scope', '$rootScope', 'Api', 'Texts', 'FileSrv', 'NetSrv', function($scope, $rootScope, Api, Texts, FileSrv, NetSrv) {
            // 数据列表
            // $scope.dataList = [];
            var dataLists = {
                '12002': [],
                '12003': [],
                '12004': []
            };
            Object.defineProperty($scope, 'dataList', {
                get: function() {
                    return dataLists[$scope.$parent.activeTemplate];
                },
                set: function(val) {
                    dataLists[$scope.$parent.activeTemplate] = val;
                }
            });
            // 选定的图片索引
            var activeIndexs = {
                '12002': -1,
                '12003': -1,
                '12004': -1
            };
            Object.defineProperty($scope, 'activeIndex', {
                get: function() {
                    return activeIndexs[$scope.$parent.activeTemplate];
                },
                set: function(val) {
                    activeIndexs[$scope.$parent.activeTemplate] = val;
                }
            });

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    id: UUID.generate(),
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.busLis,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: $scope.dataList[$scope.activeIndex].file,
                        template: $scope.$parent.activeTemplate,
                        openField: Texts.fields.openField($scope.$parent.activeTemplate)
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        .controller('demoBusLisCtrl.multiple', ['$scope', '$rootScope', 'Api', 'Texts', 'FileSrv', 'NetSrv', function($scope, $rootScope, Api, Texts, FileSrv, NetSrv) {
            // 数据列表
            var dataLists = {
                '12002': [],
                '12003': [],
                '12004': []
            };
            Object.defineProperty($scope, 'dataList', {
                get: function() {
                    return dataLists[$scope.$parent.activeTemplate];
                },
                set: function(val) {
                    dataLists[$scope.$parent.activeTemplate] = val;
                }
            });
            // 选定的图片索引
            var activeIndexs = {
                '12002': { group: -1, item: -1 },
                '12003': { group: -1, item: -1 },
                '12004': { group: -1, item: -1 }
            };
            Object.defineProperty($scope, 'activeIndex', {
                get: function() {
                    return activeIndexs[$scope.$parent.activeTemplate];
                },
                set: function(val) {
                    activeIndexs[$scope.$parent.activeTemplate] = val;
                }
            });

            // 一组的限制长度
            $scope.maxLength = 9;
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            var ocrResult = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult));
                            for (var k in ocrResult) {
                                if (commonTh.indexOf(k) === -1) {
                                    commonTh.push(k);
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.busLis,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file,
                                template: $scope.$parent.activeTemplate,
                                openField: Texts.fields.openField($scope.$parent.activeTemplate)
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };

            // 切换财报类型时回组模式
            $scope.$watch('$parent.activeTemplate', function() {
                $scope.viewMode = 'group';
            });

            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 全文识别
        .controller('demoFullTextCtrl', ['$scope', 'NetSrv', 'Api', 'FileSrv', '$window', 'Texts', function($scope, NetSrv, Api, FileSrv, $window, Texts) {
            // key 字典
            $scope.trans = Texts.trans.fullTextCtrl;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';
            // 识别类型
            $scope.iType = '0';
            // 开启座标
            $scope.coordinate = false;
        }])

        // 全文识别单张
        .controller('demoFullTextCtrl.single', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', 'Texts', function($scope, $rootScope, NetSrv, Api, FileSrv, Texts) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp', 'application/pdf'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    params: {
                        coordinate: $scope.$parent.$parent.coordinate,
                        iType: $scope.$parent.$parent.iType
                    },
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.fullText,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        myfile: $scope.dataList[$scope.activeIndex].file,
                        iType: $scope.dataList[$scope.activeIndex].params.iType,
                        coordinate: $scope.dataList[$scope.activeIndex].params.coordinate ? '1' : '0'
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };

            // 选择的图片改变时恢复识别类型的选择
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 读取识别类型和座标配置
                    $scope.$parent.$parent.iType = $scope.dataList[newVal].params.iType;
                    $scope.$parent.$parent.coordinate = $scope.dataList[newVal].params.coordinate;
                }
            });

            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 全文识别批量
        .controller('demoFullTextCtrl.multiple', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', 'Texts', function($scope, $rootScope, NetSrv, Api, FileSrv, Texts) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.params = {
                    coordinate: $scope.$parent.$parent.coordinate,
                    iType: $scope.$parent.$parent.iType
                };
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            var ocrResult = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult));
                            var resLength = ocrResult.length;
                            while (resLength--) {
                                for (var k in ocrResult[resLength]) {
                                    if (commonTh.indexOf(k) === -1) {
                                        commonTh.push(k);
                                    }
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp', 'application/pdf'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.fullText,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                myfile: $scope.dataList[$scope.activeIndex.group].items[index].file,
                                iType: $scope.dataList[$scope.activeIndex.group].items[index].params.iType,
                                coordinate: $scope.dataList[$scope.activeIndex.group].items[index].params.coordinate ? '1' : '0'
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };

            // 选择的组或图片改变时恢复识别类型的选择
            $scope.$watch('activeIndex', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    // 读取识别类型和座标配置
                    $scope.$parent.$parent.coordinate = $scope.dataList[newVal.group].items[newVal.item].params.coordinate;
                    $scope.$parent.$parent.iType = $scope.dataList[newVal.group].items[newVal.item].params.iType;
                }
            }, true);


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 助账宝
        .controller('solutionHelpAccountCtrl', ['$scope', '$rootScope', 'Texts', '$window', 'Api', 'DataSrv', 'NetSrv', function($scope, $rootScope, Texts, $window, Api, DataSrv, NetSrv) {
            // 解析模板
            $scope.path = Texts.path.helpAccount;

            /* 配置识别域 */
            // 获取识别域配置
            $scope.fields = Texts.fields.getConfig();
            $scope.$watch('fields', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    window.localStorage.setItem('helpAccountVatFields', JSON.stringify($scope.fields));
                }
            }, true);

            // 输出已勾选的参数
            Object.defineProperty($scope, 'openFieldStr', {
                get: function() {
                    return Texts.fields.openField();
                }
            });

            var ws = null;

            function createWS(sequence) {
                // 创建 WebSocket
                ws = new WebSocket(Api.helpAccountQueryWS);
                ws.onopen = function(e) {
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
                        files[UUID.generate()] = fileList[filesLength];
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
                    $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + maxLength + ' 张图片', type: 'warning' });
                }
                // 包含非图片
                if (hasIvldFile) {
                    $rootScope.notify.open({ title: '警告', content: '包含非图片，非图片将被过滤', type: 'warning' });
                }
                // 无文件退出
                if (!filesCount) {
                    return;
                }

                // 创建事务编号
                $scope.currentSequence = UUID.generate();
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

                    formData.append('visitorFlag', window.sessionStorage.getItem('visitorFlag'));
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
                            success: function(res) {
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

        // 手写签名
        .controller('demoHandwrittenSignatureCtrl', ['$scope', 'Texts', function($scope, Texts) {
            // 模板路径
            // $scope.path = Texts.path.handwrittenSignature;
        }])

        // 手写签名识别
        .controller('demoHandwrittenSignatureCtrl.recognition', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选中图像的索引
            $scope.activeIndex = null;
            // 上传限制数量
            $scope.limitLength = 9;
            // 是否已完成
            $scope.finished = false;

            // 切换选中
            $scope.changeIndex = function(index) {
                $scope.activeIndex = $scope.dataList[index] ? index : $scope.activeIndex;
            };

            var CurrentData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                // 需要保存框选数据，先创建结构
                this.cropper = {
                    id: UUID.generate(),
                    enable: false,
                    data: null
                };
            };
            // 添加文件
            $scope.fileChanged = function(ele) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };

                // 数组形式的文件列表
                var fileList = [];

                // 筛选类型是图片的文件
                var length = ele.files.length;
                // 包含不符合文件类型
                var hasInvalidType = false;
                while (length--) {
                    if (/^image\/\w+$/g.test(ele.files[length].type)) {
                        fileList.push(ele.files[length]);
                    } else {
                        hasInvalidType = true;
                    }
                }
                if (hasInvalidType) {
                    $rootScope.notify.open({ title: '警告', content: '不受支持的文件已被清除。', type: 'warning' });
                }
                // 超过数量则截取
                if ($scope.dataList.length + ele.files.length > $scope.limitLength) {
                    fileList = Array.prototype.slice.call(fileList, 0, $scope.limitLength - $scope.dataList.length);
                    $rootScope.notify.open({ title: '警告', content: '最多上传 ' + $scope.limitLength + ' 张图，超过部分已被截取。', type: 'warning' });
                }

                // 将文件列表以特定结构处理后添加给数据列表
                length = fileList.length;
                while (length--) {
                    $scope.dataList.push(new CurrentData(fileList[length]));
                }

                // 选中索引置零
                $scope.changeIndex($scope.activeIndex === null ? 0 : $scope.activeIndex);

                // 新增图片，数据改变，可重新识别
                $scope.finished = false;

                // 刷新数据
                $scope.$apply('dataList');

                // 清空选中文件，避免下次选中相同文件无响应
                ele.value = '';
            };

            // 重置（清除队列）
            $scope.reset = function() {
                $scope.dataList = [];
                $scope.activeIndex = null;
                $scope.finished = false;
            };

            // 监听 cropchange 事件，数据发生变化后可再次识别
            $scope.$on('cropchange', function() {
                $scope.finished = false;
                $scope.$apply('finished');
            });

            // 识别请求
            $scope.recognition = function() {
                $rootScope.spinnerShow = true;
                var length = $scope.dataList.length,
                    lengthBackup = length;
                var counter = 0;
                while (length--) {
                    (function() {
                        // 利用闭包缓存索引
                        var index = length;
                        var success = function(res) {
                            if (res && res.mpRecognition) {
                                $scope.dataList[index].result = res;
                            }
                            counter++;
                            if (counter === lengthBackup) {
                                $rootScope.spinnerShow = false;
                                $scope.finished = true;
                            }
                        };
                        var data = {
                            imgFile: $scope.dataList[index].file,
                            visitorFlag: window.sessionStorage.getItem('visitorFlag')
                        };
                        // 如果有 cropper，取坐标参数
                        if ($scope.dataList[index].cropper.enable) {
                            data.x = $scope.dataList[index].cropper.data.x;
                            data.y = $scope.dataList[index].cropper.data.y;
                            data.width = $scope.dataList[index].cropper.data.width;
                            data.height = $scope.dataList[index].cropper.data.height;
                        }
                        NetSrv.ajaxFw({
                            url: Api.handwrittenSignature.recognition,
                            data: FileSrv.formData(data),
                            headers: {
                                'Content-Type': undefined
                            },
                            success: success,
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };
        }])

        // 手写签名验证
        .controller('demoHandwrittenSignatureCtrl.verification', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选中组别的索引
            $scope.activeIndex = null;
            // 多张限制数量
            $scope.limitLength = 9;
            // 文件 (file) 与 blob url (src) 对象的包装，修改文件重新生成 url
            var FileItem = function(file) {
                if (!(file instanceof File)) {
                    return;
                }
                var theFile = file;
                var that = this;
                Object.defineProperty(this, 'file', {
                    get: function() {
                        return theFile;
                    },
                    set: function(val) {
                        theFile = val;
                        that.src = window.URL.createObjectURL(val);
                    }
                });
                this.file = file;
            };
            // 一组比对数据
            var CurrentData = function(originFile, contrastFiles) {
                this.origin = new FileItem(originFile);
                // 浅拷贝，避免影响原数据
                this.contrast = contrastFiles ? $.extend([], contrastFiles) : [];
                this.result = null;
                this.finished = false;
            };
            Object.defineProperty(CurrentData.prototype, 'clone', {
                value: function() {
                    var newObj = new CurrentData();
                    newObj.origin = this.origin;
                    newObj.contrast = $.extend([], this.contrast);
                    newObj.result = this.result;
                    newObj.finished = this.finished;
                    return newObj;
                },
                enumerable: false,
            });
            // 显示在当前视图中的数据
            $scope.currentData = new CurrentData();
            // 添加文件
            $scope.fileChanged = {
                // 添加范本图片
                origin: function(ele) {
                    // 有文件才进行处理
                    if (!ele.files.length) {
                        return;
                    };
                    // 文件类型合格才进行处理
                    if (!(/^image\/\w+$/g.test(ele.files[0].type))) {
                        return;
                    };
                    // 添加范本图片
                    $scope.currentData = new CurrentData(ele.files[0], $scope.currentData.contrast);
                    // 刷新数据
                    $scope.$apply('currentData');
                    // 清除选择的文件
                    ele.value = '';
                },
                // 添加对比图片（复数）
                contrast: function(ele) {
                    // 有文件才进行处理
                    if (!ele.files.length) {
                        return;
                    };


                    var fileList = [];
                    // 筛选类型符合的文件加入当前数据
                    var length = ele.files.length;
                    var hasInvalidType = false;
                    while (length--) {
                        if (/^image\/\w+$/g.test(ele.files[length].type)) {
                            fileList.push(new FileItem(ele.files[length]));
                        } else {
                            hasInvalidType = true;
                        };
                    }
                    if (hasInvalidType) {
                        $rootScope.notify.open({ title: '警告', content: '不受支持的文件已被清除。', type: 'warning' });
                    }
                    // 生成新的数组
                    $scope.currentData.contrast = $scope.currentData.contrast.slice();
                    // 超过数量则截取
                    if ($scope.currentData.contrast.length + ele.files.length > $scope.limitLength) {
                        Array.prototype.push.apply($scope.currentData.contrast, fileList.slice(0, $scope.limitLength - $scope.currentData.contrast.length));
                        $rootScope.notify.open({ title: '警告', content: '最多上传 ' + $scope.limitLength + ' 张图，超过部分已被截取。', type: 'warning' });
                    } else {
                        Array.prototype.push.apply($scope.currentData.contrast, fileList);
                    }

                    // 数据改变，重新允许比对
                    $scope.currentData.finished = false;
                    // 刷新数据
                    $scope.$apply('currentData');
                    // 清除选择的文件
                    ele.value = '';
                }
            };
            // 重置对比
            $scope.reset = function() {
                $scope.currentData.contrast = [];
            };
            // 比对
            $scope.comparison = function() {
                var success = function(res) {
                    if (res && res.mpRecognition) {
                        $scope.currentData.result = res;
                    }
                    // 任务完成
                    $scope.currentData.finished = true;
                    // 拷贝 currentData 添加进 dataList
                    $scope.dataList.push($scope.currentData.clone());
                    // 设置选中索引
                    $scope.activeIndex = ($scope.activeIndex === null) ? 0 : ($scope.dataList.length - 1);
                };
                NetSrv.ajaxFw({
                    url: Api.handwrittenSignature.verification,
                    data: FileSrv.formData({
                        imgFiles: (function() {
                            var files = [$scope.currentData.origin.file];
                            var length = $scope.currentData.contrast.length;
                            while (length--) {
                                files.push($scope.currentData.contrast[length].file);
                            }
                            return files;
                        })(),
                        visitorFlag: window.sessionStorage.getItem('visitorFlag')
                    }),
                    headers: {
                        'Content-Type': undefined
                    },
                    success: success,
                    failAlert: true
                });
            };
            // swiper 配置
            $scope.swiper = {
                slidesPerView: 4,
                spaceBetween: 30,
                observer: true,
                observeParents: true,
                breakpoints: {
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 40,
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                    }
                },
                slideToClickedSlide: true,
                centeredSlides: true
            };
            // activeIndex 改变时提取数据为 currentData
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                $scope.activeIndex = index;
                $scope.currentData = $scope.dataList[index].clone();
                $scope.$apply('currentData');
            });
        }])

        // 社保卡识别
        .controller('demoSocialSecurityCardCtrl', ['$scope', 'Texts', function($scope, Texts) {
            // key 字典
            $scope.trans = Texts.trans.socialSecurityCard;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';

            // 过滤 key，结果中的部分 key 不应显示
            $scope.keyEnable = function(key) {
                var filtList = [
                    'faceImg' // 提取的人脸单独显示
                ];
                return filtList.indexOf(key) === -1;
            };
        }])

        // 社保卡单张
        .controller('demoSocialSecurityCardCtrl.single', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.socialSecurityCard,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: $scope.dataList[$scope.activeIndex].file
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 社保卡批量
        .controller('demoSocialSecurityCardCtrl.multiple', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            var ocrInfo = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo));
                            for (var k in ocrInfo) {
                                if (commonTh.indexOf(k) === -1) {
                                    commonTh.push(k);
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.socialSecurityCard,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 火车票
        .controller('demoTrainTicketCtrl', ['$scope', 'Texts', function($scope, Texts) {
            // key 字典
            $scope.trans = Texts.trans.trainTicket;
            // 单张: single / 批量: multiple
            $scope.modeType = 'single';
        }])

        // 火车票单张
        .controller('demoTrainTicketCtrl.single', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            // 选定的图片索引
            $scope.activeIndex = -1;

            // 文件改变时时识别
            $scope.fileChanged = function(ele) {
                // 有文件才进行处理
                if (!ele.files.length) {
                    return
                };
                // 文件不是合法类型弹出提示并停止
                if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[0].type) === -1) {
                    $rootScope.notify.open({ title: '错误', content: '选择的文件类型不合法，请重新选择。', type: 'error' });
                    return;
                };
                // 当前项数据
                var itemData = {
                    file: ele.files[0],
                    src: window.URL.createObjectURL(ele.files[0]),
                    result: null
                };
                // 往列表添加数据
                $scope.dataList.push(itemData);
                $scope.activeIndex = $scope.dataList.length - 1;
                // 同步 view
                $scope.$apply('dataList');
                // 执行识别
                // 发请求
                NetSrv.ajaxFw({
                    url: Api.trainTicket,
                    data: FileSrv.formData({
                        visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                        imgFile: $scope.dataList[$scope.activeIndex].file
                    }),
                    headers: { 'Content-Type': undefined },
                    success: function(res) {
                        $scope.dataList[$scope.activeIndex].result = res;
                    },
                    failAlert: true
                });
                // 选择完时置空，避免下次选择相同文件时不触发 change 事件
                ele.value = '';
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex = index;
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 火车票批量
        .controller('demoTrainTicketCtrl.multiple', ['$scope', '$rootScope', 'NetSrv', 'Api', 'FileSrv', function($scope, $rootScope, NetSrv, Api, FileSrv) {
            // 数据列表
            $scope.dataList = [];
            $scope.maxLength = 9;
            // 选定的图片索引
            $scope.activeIndex = {
                group: -1,
                item: -1
            };
            // 查看模式
            $scope.viewMode = 'group';

            // 单个数据构造器
            var ItemData = function(file) {
                this.file = file;
                this.src = window.URL.createObjectURL(file);
                this.result = null;
            };

            // 组数据构造器
            var GroupData = function() {
                this.items = [];
                Object.defineProperty(this, 'commonTh', {
                    get: function() {
                        var commonTh = [];
                        if (!$scope.dataList[$scope.activeIndex.group] || !$scope.dataList[$scope.activeIndex.group].items.length) {
                            return commonTh;
                        }
                        var length = $scope.dataList[$scope.activeIndex.group].items.length;
                        while (length--) {
                            // 结果不存在或失败跳过
                            if (!$scope.dataList[$scope.activeIndex.group].items[length].result || ($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.resCd !== '00000')) {
                                continue;
                            }
                            var data = JSON.parse(angular.toJson($scope.dataList[$scope.activeIndex.group].items[length].result.mpRecognition.ocrInfoList.ocrInfo.ocrResult.data));
                            var resLength = data.length;
                            while (resLength--) {
                                for (var k in data[resLength]) {
                                    if (commonTh.indexOf(k) === -1) {
                                        commonTh.push(k);
                                    }
                                }
                            }
                        }
                        return commonTh;
                    }
                });
            };

            // 添加文件时
            $scope.fileChanged = function(ele, type) {
                // 未选择文件停止
                if (!ele.files.length) {
                    return;
                };
                // 文件列表作为数组存储使其能够被操作
                var fileList = [];
                // 记录是否含有不合法文件
                var hasInvalidFile = false;
                // 文件不是合法类型停止
                for (var i = 0; i < ele.files.length; i++) {
                    if (['image/jpeg', 'image/png', 'image/bmp'].indexOf(ele.files[i].type) !== -1) {
                        fileList.push(ele.files[i]);
                    } else {
                        hasInvalidFile = true;
                    }
                }
                // 含有不合法文件，弹出提示
                if (hasInvalidFile) {
                    $rootScope.notify.open({ title: '警告', content: '选择的文件中包含不合法文件，已被过滤。', type: 'warning' });
                }
                // 过滤后文件数量改变，再次检查，无文件则停止
                if (!fileList.length) {
                    return;
                }
                // 根据添加方式的不同，执行不同行为
                ({
                    group: function() {
                        // 长度超过 9 ，截取前 9 张
                        if (fileList.length > $scope.maxLength) {
                            fileList = fileList.slice(0, $scope.maxLength);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        var groupData = new GroupData();
                        fileList.forEach(function(v, i) {
                            groupData.items.push(new ItemData(v));
                        });
                        $scope.dataList.push(groupData);
                        $scope.activeIndex.group = $scope.dataList.length - 1;
                        $scope.activeIndex.item = 0;
                    },
                    item: function() {
                        // 总长度超过 9 ，截取前 9 - 已存在张数
                        if (fileList.length > ($scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length)) {
                            fileList = fileList.slice(0, $scope.maxLength - $scope.dataList[$scope.activeIndex.group].items.length);
                            $rootScope.notify.open({ title: '警告', content: '单次最多识别 ' + $scope.maxLength + ' 张图片，超过部分已被截取。', type: 'warning' });
                        }
                        fileList.forEach(function(v, i) {
                            $scope.dataList[$scope.activeIndex.group].items.push(new ItemData(v));
                        });
                        $scope.activeIndex.item = $scope.dataList[$scope.activeIndex.group].items.length - 1;
                    }
                })[type]();
                // 刷新 vm
                $scope.$apply('activeIndex');
                // 清空选择的文件
                ele.value = '';
                // 发请求之前，打开菊花圈
                $rootScope.spinnerShow = true;
                // 遍历发请求
                var length = fileList.length;
                var reqCount = length;
                // 添加之前已存在的长度（新添加时是 0，无需区分添加 group 和 item）
                var baseLength = $scope.dataList[$scope.activeIndex.group].items.length - length;
                while (length--) {
                    (function() {
                        var index = baseLength + length;
                        // 发请求
                        NetSrv.ajaxFw({
                            url: Api.trainTicket,
                            data: FileSrv.formData({
                                visitorFlag: window.sessionStorage.getItem('visitorFlag'),
                                imgFile: $scope.dataList[$scope.activeIndex.group].items[index].file
                            }),
                            headers: { 'Content-Type': undefined },
                            success: function(res) {
                                $scope.dataList[$scope.activeIndex.group].items[index].result = res;
                                reqCount--;
                                if (!reqCount) {
                                    $rootScope.spinnerShow = false;
                                }
                            },
                            failAlert: true,
                            spinner: false
                        });
                    })();
                }
            };


            // 切换时修改 activeIndex
            $scope.$on('swiperSlideChange', function(e, index) {
                if (typeof index !== 'number') {
                    return;
                }
                // 同步激活索引
                $scope.activeIndex.group = index;
                $scope.activeIndex.item = 0;
                // 切回组模式
                $scope.viewMode = 'group';
                // 触发脏检查
                $scope.$apply('activeIndex');
            });
        }])

        // 价格方案
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