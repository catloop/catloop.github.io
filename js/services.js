(function(angular) {
    var mpsSrvs = angular.module('mpsSrvs', [])
        // 接口 URL
        .service('Api', [function() {
            // 主机名
            this.host = '//r.micropattern.com';
            // this.host = '//10.6.5.63:8099';
            // this.host = '//10.2.34.68:8001';
            // this.host = '//10.2.34.62:8001';
            // this.host = '//10.2.33.59:8080';
            // this.host = '//10.2.33.55:8081';
            // this.host = '//10.2.33.27:8082';
            // this.host = '//59.172.153.82:8001';
            // this.host = '//10.2.33.38:8080';
            // this.host = '';
            // this.host = ['/', '/', window.location.host].join('');
            // 登录相关 API
            // this.loginStatus = this.host + '/mycenter/getLoginStatus';
            this.loginStatus = this.host + '/app/getLoginStatus';
            this.sysParams = this.host + '/app/getSysParams';
            this.login = this.host + '/mycenter/index.html#/account/login';
            // this.login = this.host + '/mycenter/sign_in';
            this.regist = this.host + '/mycenter/index.html#/account/regist';
            // this.regist = this.host + '/mycenter/sign_up';
            this.logout = this.host + '/app/logout';
            // 算法演示相关 API
            this.face = this.host + '/platform/faceone';
            this.idCard = this.host + '/platform/idcard';
            this.creditCard = this.host + '/platform/bankocr';
            this.vat = this.host + '/platform/invoiceocr';
            this.finSta = this.host + '/platform/finstatementocr';
            this.busLis = this.host + '/platform/filedocr';
            this.fullText = this.host + '/platform/fullTextocr';
            this.silentLive = this.host + '/platform/livenessVerify';
            // 批量识别
            this.batch = this.host + '/platform/batch/serviceForFile';
            // 记账宝查询 WebSocket 接口
            this.helpAccountQueryWS = 'ws:' + this.host + '/webSocketServer';
            // 记账宝调用接口
            this.helpAccountCall = this.host + '/platform/accountantocr';

            // 价格相关 API
            this.price = {
                imageStorage: this.host + '/app/getImageFeeList',
                feesPerTime: this.host + '/app/getFeesListAll?feesType=1',
                feesPerMonth: this.host + '/app/getFeesListAll?feesType=2',
                feesPerYear: this.host + '/app/getFeesListAll?feesType=3'
            };
        }])
        .service('Texts', ['$state', '$window', function($state, $window) {
            // 演示台的描述信息与图片
            var banners = {
                face: {
                    className: 'face',
                    title: '人脸识别',
                    content: '对比两张人脸并给出相似度，识别活体',
                    link: '/mycenter/index.html',
                    linkText: '立即体验'
                },
                card: {
                    className: 'card',
                    title: '卡证识别',
                    content: '提供身份证正反面、银行卡等证件服务',
                    link: '/mycenter/index.html',
                    linkText: '立即体验'
                },
                bill: {
                    className: 'bill',
                    title: '票据识别',
                    content: '提供财务报表、营业执照、增值税发票等票据识别服务',
                    link: '/mycenter/index.html',
                    linkText: '立即体验'
                },
                text: {
                    className: 'text',
                    title: '全文识别',
                    content: '高效快速的解决繁琐乏味的工作',
                    link: '/mycenter/index.html',
                    linkText: '立即体验'
                },
            };
            this.demoTexts = {
                'demo.face': {
                    desc: {
                        tit: '人脸比对',
                        con: '请上传本地图片，体验微模式人脸多特征属性的检测与识别功能。',
                        banner: banners.face
                    },
                    app: [{
                        tit: 'VIP 客户服务',
                        img: 'images/demo/yycj01.png',
                        con: '对 VIP 客服进行自动人脸检测和比对，识别 VIP 客户信息并及时将信息推送到客户经理手持设备中，提升客户服务质量。'
                    }, {
                        tit: '在线身份验证',
                        img: 'images/demo/yycj02.png',
                        con: '对于客户现场照和身份证表面照片或联网核查照进行人脸识别和比对，实现在线身份验证，做好风险防范。'
                    }]
                },
                'demo.idCard': {
                    desc: {
                        tit: '身份证识别',
                        con: '请上传本地图片，体验微模式精准的身份证信息识别功能。',
                        banner: banners.card
                    },
                    app: [{
                        tit: '二代证实名验证',
                        img: 'images/demo/yycj03.png',
                        con: '识别身份证上的姓名和身份证号，发起联网核查，校验姓名和身份证号的一致性。'
                    }, {
                        tit: '远程开户',
                        img: 'images/demo/yycj04.png',
                        con: '识别一类账户银行卡表面信息，和银行业务系统对接进行校验，加快二类、三类账户的开通速度。'
                    }]
                },
                'demo.creditCard': {
                    desc: {
                        tit: '银行卡识别',
                        con: '请上传本地图片，体验快速准确的银行卡信息识别功能。',
                        banner: banners.card
                    },
                    app: [{
                        tit: '银行卡绑定',
                        img: 'images/demo/yycj03.png',
                        con: '快速准确地识别银行卡相关信息，用于手机银行卡绑定业务，无需手动输入银行卡号。'
                    }, {
                        tit: '证卡实名验证',
                        img: 'images/demo/yycj04.png',
                        con: '识别银行卡上的卡号以及二代证上的姓名和身份证信息，校验姓名、身份证号、银行卡号的一致性。'
                    }]
                },
                'demo.vat': {
                    desc: {
                        tit: '增值税发票识别',
                        con: '请上传本地样本，目前支持体验增值税普通发票、增值税专用发票和增值税电子发票识别，支持PNG、JPG、BMP、PDF格式。',
                        banner: banners.bill
                    },
                    app: [{
                        tit: '税务认证',
                        img: 'images/demo/yycj05.png',
                        con: '识别采集增值税发票信息，并形成电子档上传税务认证系统，进行税务认证。'
                    }, {
                        tit: '票据归档',
                        img: 'images/demo/yycj06.png',
                        con: '结构化数据导出，方便票据信息的归档。'
                    }]
                },
                'demo.finSta': {
                    desc: {
                        tit: '财报识别',
                        con: '请上传本地图片，体验财务报表识别，快速完成财务报表的信息采集与结构化。',
                        banner: banners.bill
                    },
                    app: [{
                        tit: '财务审计',
                        img: 'images/demo/yycj05.png',
                        con: '识别财务报表信息，减少人工补录，提高财务审核效益。'
                    }, {
                        tit: '财报归档',
                        img: 'images/demo/yycj06.png',
                        con: '结构化数据导出，方便图表信息的归档。'
                    }]
                },
                'demo.busLis': {
                    desc: {
                        tit: '营业执照识别',
                        con: '请上传本地图片，体验营业执照识别，快速完成营业执照的信息采集与结构化。',
                        banner: banners.bill
                    },
                    app: [{
                        tit: '企业证照审核',
                        img: 'images/demo/yycj07.png',
                        con: '识别企业证照信息，减少人工补录，提高对公开户等业务办理效率。'
                    }, {
                        tit: '证照归档',
                        img: 'images/demo/yycj06.png',
                        con: '证照归档—结构化数据导出，方便图像信息的归档。'
                    }]
                },
                'demo.fullText': {
                    desc: {
                        tit: '全文字识别',
                        con: '请上传本地图片，体验全文识别，快速完成资料结构化整理。',
                        banner: banners.text
                    },
                    app: [{
                        tit: '法院文件识别',
                        img: 'images/demo/fullText01.png',
                        con: '用于法院纸质文件识别，减少人工输入过程，提高输入效率。'
                    }, {
                        tit: '资料结构化整理',
                        img: 'images/demo/fullText02.png',
                        con: '用于笔记、书籍、档案等资料识别，方便您完成大量的资料结构化整理工作。'
                    }]
                },
                'demo.silentLive': {
                    desc: {
                        tit: '静默活体检测',
                        // con: '请拍摄或上传三张图片，体验静默活体检测，识别静态图像上的生物目标是否为活体。',
                        con: '请上传三张图片，体验静默活体检测，识别静态图像上的生物目标是否为活体。',
                        banner: banners.face
                    },
                    app: [{
                        tit: '人证合一服务',
                        img: 'images/demo/silentLive01.png',
                        con: '使用深度学习算法，不需要用户配合动作，通过摄像头检测是否为活体，用于远程开户、远程信贷等使用场景。'
                    }, {
                        tit: '酒店入住身份验证',
                        img: 'images/demo/silentLive02.png',
                        con: '入住酒店时使用一体机进行活体检测和身份验证，确认本人信息后，进行登记入住。'
                    }]
                }
            };

            // 演示台的占位样本图片与默认结果模板
            this.sampleUrl = {
                face: {
                    img: ['images/demo/placeholder-face1.png', 'images/demo/placeholder-face2.png'],
                    tpl: 'tpls/demo/sampleResult/face.html'
                },
                idCard: {
                    img: 'images/demo/placeholder-idcard.png',
                    tpl: 'tpls/demo/sampleResult/idCard.html'
                },
                creditCard: {
                    img: 'images/demo/placeholder-creditcard.png',
                    tpl: 'tpls/demo/sampleResult/creditCard.html'
                },
                finSta: {
                    img: 'images/demo/placeholder-finsta.png',
                    tpl: 'tpls/demo/sampleResult/finSta.html'
                },
                busLis: [{
                        img: 'images/demo/placeholder-buslis-12002.png',
                        tpl: 'tpls/demo/sampleResult/busLis-12002.html'
                    },
                    {
                        img: 'images/demo/placeholder-buslis-12003.png',
                        tpl: 'tpls/demo/sampleResult/busLis-12003.html'
                    },
                    {
                        img: 'images/demo/placeholder-buslis-12004.png',
                        tpl: 'tpls/demo/sampleResult/busLis-12004.html'
                    }
                ],
                vat: {
                    img: 'images/demo/placeholder-vat.png',
                    tpl: 'tpls/demo/sampleResult/vat.html'
                },
                fullText: {
                    img: 'images/demo/placeholder-fulltext.png',
                    tpl: 'tpls/demo/sampleResult/fullText.html'
                }
            };

            // 解析器路径
            this.resolver = {
                face: 'tpls/demo/resolver/face.html',
                idCard: 'tpls/demo/resolver/idCard.html',
                creditCard: 'tpls/demo/resolver/creditCard.html',
                finSta: 'tpls/demo/resolver/finSta.html',
                busLis: 'tpls/demo/resolver/busLis.html',
                vat: 'tpls/demo/resolver/vat.html',
                fullText: 'tpls/demo/resolver/fullText.html',
                helpAccount: {
                    resultDataTable: 'tpls/solution/helpAccount/resultDataTable.html',
                    detailModal: 'tpls/solution/helpAccount/detailModal.html',
                    resultResolver: 'tpls/solution/helpAccount/resultResolver.html',
                    allResultDataTable: 'tpls/solution/helpAccount/allResultDataTable.html'
                }
            };

            // 批量解析器路径
            this.rsvBatch = {
                idCard: {
                    // 总览结果解析器
                    pandect: 'tpls/demo/resolver/batch/idCard.pandect.html',
                    // 单结果解析器
                    single: 'tpls/demo/resolver/batch/idCard.single.html'
                },
                creditCard: {
                    pandect: 'tpls/demo/resolver/batch/creditCard.pandect.html',
                    single: 'tpls/demo/resolver/batch/creditCard.single.html'
                },
                finSta: {
                    single: 'tpls/demo/resolver/batch/finSta.single.html'
                },
                busLis: {
                    pandect: 'tpls/demo/resolver/batch/busLis.pandect.html',
                    single: 'tpls/demo/resolver/batch/busLis.single.html'
                },
                vat: {
                    pandect: 'tpls/demo/resolver/batch/vat.pandect.html',
                    single: 'tpls/demo/resolver/batch/vat.single.html'
                }
            };

            // 识别域
            this.fields = {
                vat: {
                    "NO": {
                        name: "NO",
                        value: "InvoiceNumber",
                        checked: true,
                        display: true,
                        required: true
                    },
                    "开票日期": {
                        name: "开票日期",
                        value: "InvoiceDate",
                        checked: true,
                        display: true
                    },
                    "购买方纳税人识别号": {
                        name: "购买方纳税人识别号",
                        value: "BuyerId",
                        checked: true,
                        display: true
                    },
                    "密码区": {
                        name: "密码区",
                        value: "Password",
                        checked: false,
                        display: true
                    },
                    "价税合计(大写)": {
                        name: "价税合计(大写)",
                        value: "TotalPriceTaxUpper",
                        checked: true,
                        display: true
                    },
                    "价税合计(小写)": {
                        name: "价税合计(小写)",
                        value: "TotalPriceTaxLower",
                        checked: true,
                        display: true
                    },
                    "代码区域种类": {
                        name: "代码区域种类",
                        value: "CodeAreaType",
                        checked: true,
                        display: true,
                        required: true
                    },
                    "销售方纳税人识别号": {
                        name: "销售方纳税人识别号",
                        value: "SellerId",
                        checked: true,
                        display: true
                    },
                    "合计金额": {
                        name: "合计金额",
                        value: "TotalPrice",
                        checked: true,
                        display: true
                    },
                    "合计税额": {
                        name: "合计税额",
                        value: "TotalTax",
                        checked: true,
                        display: true
                    },
                    /*"价税合计金额验证": {
                        name: "价税合计金额验证",
                        value: "totalPriceVerify",
                        checked: true,
                        display: false
                    },*/
                    "购买方名称": {
                        name: "购买方名称",
                        value: "BuyerName",
                        checked: true,
                        display: true
                    },
                    "销售方名称": {
                        name: "销售方名称",
                        value: "SellerName",
                        checked: true,
                        display: true
                    },
                    "校验码": {
                        name: "校验码",
                        value: "CheckCode",
                        checked: true,
                        display: true
                    },
                    /* 20180227 add */
                    /*'机器编号': {
                        name: '机器编号',
                        value: 'MachineNumber',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '购买方地址电话': {
                        name: '购买方地址电话',
                        value: 'BuyerAddrPhone',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '购买方开户行账号': {
                        name: '购买方开户行账号',
                        value: 'BuyerBankAccount',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '销售方地址电话': {
                        name: '销售方地址电话',
                        value: 'SellerAddrPhone',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '销售方开户行账号': {
                        name: '销售方开户行账号',
                        value: 'SellerBankAccount',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '备注': {
                        name: '备注',
                        value: 'Remarks',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '收款人': {
                        name: '收款人',
                        value: 'Payee',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '复核': {
                        name: '复核',
                        value: 'Reviewer',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '开票人': {
                        name: '开票人',
                        value: 'Drawer',
                        checked: true,
                        display: false,
                        incomplete: true
                    },
                    '销售方（章）': {
                        name: '销售方（章）',
                        value: 'SellerSeal',
                        checked: true,
                        display: false,
                        incomplete: true
                    },*/
                    /* /20180227 add */
                    "明细域": {
                        name: "明细域",
                        value: "DetailRegion",
                        checked: false,
                        display: true
                    }
                },
                busLis: {
                    "12002": {
                        "注册号": {
                            name: "注册号",
                            value: "registrationNumber",
                            checked: true,
                            display: true
                        },
                        "编号": {
                            name: "编号",
                            value: "serialNumber",
                            checked: true,
                            display: true
                        },
                        "组织机构代码证号": {
                            name: "组织机构代码证号",
                            value: "OrganizationCodeCertificate",
                            checked: true,
                            display: true
                        },
                        "税务登记号": {
                            name: "税务登记号",
                            value: "taxRegistryNumber",
                            checked: true,
                            display: true
                        },
                        "统一社会信用代码": {
                            name: "统一社会信用代码",
                            value: "socialCreditCode",
                            checked: true,
                            display: true
                        },
                        "名称": {
                            name: "名称",
                            value: "businessLicenseName",
                            checked: true,
                            display: true
                        },
                        "类型/主体类型": {
                            name: "类型/主体类型",
                            value: "businessLicenseType,mainType",
                            checked: true,
                            display: true
                        },
                        "住所/营业场所/主要经营场所": {
                            name: "住所/营业场所/主要经营场所",
                            value: "address,busnissPlace,mainBusnissPlace",
                            checked: true,
                            display: true
                        },
                        "法定代表人/投资人/负责人/执行事务合伙人": {
                            name: "法定代表人/投资人/负责人/执行事务合伙人",
                            value: "legalRepresentativeName,investor,personInCharge,managingPartner",
                            checked: true,
                            display: true
                        },
                        "注册资本": {
                            name: "注册资本",
                            value: "registeredCapital",
                            checked: true,
                            display: true
                        },
                        "成立日期": {
                            name: "成立日期",
                            value: "dateOfEstablishment",
                            checked: true,
                            display: true
                        },
                        "营业期限/合伙期限": {
                            name: "营业期限/合伙期限",
                            value: "busnissTerm,partnerTerm",
                            checked: true,
                            display: true
                        }
                    },
                    "12003": {
                        "注册号": {
                            name: "注册号",
                            value: "registrationNumber",
                            checked: true,
                            display: true
                        },
                        "名称": {
                            name: "名称",
                            value: "businessLicenseName",
                            checked: true,
                            display: true
                        },
                        "法定代表人姓名": {
                            name: "法定代表人姓名",
                            value: "legalRepresentativeName",
                            checked: true,
                            display: true
                        },
                        "注册资本": {
                            name: "注册资本",
                            value: "registeredCapital",
                            checked: true,
                            display: true
                        },
                        "实收资本": {
                            name: "实收资本",
                            value: "paidUpCapital",
                            checked: true,
                            display: true
                        }
                    },
                    "12004": {
                        "注册号": {
                            name: "注册号",
                            value: "registrationNumber",
                            checked: true,
                            display: true
                        },
                        "字号名称/名称": {
                            name: "字号名称/名称",
                            value: "typeName,businessLicenseName",
                            checked: true,
                            display: true
                        },
                        "经营者姓名": {
                            name: "经营者姓名",
                            value: "managerName",
                            checked: true,
                            display: true
                        }
                    }
                },
                // 助账宝
                helpAccount: {
                    "购买方名称": {
                        name: "购买方名称",
                        value: "BuyerName",
                        checked: true,
                        display: true
                    },
                    "购买方纳税人识别号": {
                        name: "购买方纳税人识别号",
                        value: "BuyerId",
                        checked: true,
                        display: true
                    },
                    "开票日期": {
                        name: "开票日期",
                        value: "InvoiceDate",
                        checked: true,
                        display: true
                    },
                    "密码区": {
                        name: "密码区",
                        value: "Password",
                        checked: true,
                        display: true
                    },
                    "明细": {
                        name: "明细",
                        value: "DetailRegion",
                        checked: false,
                        display: true
                    },
                    "价税合计(大写)": {
                        name: "价税合计(大写)",
                        value: "TotalPriceTaxUpper",
                        checked: true,
                        display: true
                    },
                    "价税合计(小写)": {
                        name: "价税合计(小写)",
                        value: "TotalPriceTaxLower",
                        checked: true,
                        display: true
                    },
                    "合计金额": {
                        name: "合计金额",
                        value: "TotalPrice",
                        checked: true,
                        display: true
                    },
                    "合计税额": {
                        name: "合计税额",
                        value: "TotalTax",
                        checked: true,
                        display: true
                    },
                    "销售方名称": {
                        name: "销售方名称",
                        value: "SellerName",
                        checked: true,
                        display: true
                    },
                    "销售方纳税人识别号": {
                        name: "销售方纳税人识别号",
                        value: "SellerId",
                        checked: true,
                        display: true
                    },
                    "代码区域种类": {
                        name: "代码区域种类",
                        value: "CodeAreaType",
                        checked: true,
                        display: false
                    },
                    "NO": {
                        name: "NO",
                        value: "InvoiceNumber",
                        checked: true,
                        display: false
                    },
                    "发票代码": {
                        name: "发票代码",
                        value: "InvoiceCode",
                        checked: true,
                        display: false
                    }
                }
            };

            this.getConfig = function() {
                var that = this;
                var stateName = $state.current.name.substr($state.current.name.indexOf('.') + 1);

                var keyName = {
                    vat: 'vatFields',
                    busLis: 'busLisFields',
                    helpAccount: 'helpAccountVatFields'
                };

                return JSON.parse($window.localStorage.getItem(keyName[stateName])) || that.fields[stateName];
            };

            /*Object.defineProperties(this, {
                "getConfig": {
                    get: function(template) {
                        var that = this;
                        var stateName = $state.current.name.substr($state.current.name.indexOf('.') + 1);

                        var keyName = {
                            vat: 'vatFields',
                            busLis: 'busLisFields'
                        };

                        return JSON.parse($window.localStorage.getItem(keyName[stateName])) || that.fields[stateName];
                    }
                }
            });*/

            this.saveConfig = function(obj) {
                var stateName = $state.current.name.substr($state.current.name.indexOf('.') + 1);

                var keyName = {
                    vat: 'vatFields',
                    busLis: 'busLisFields'
                };

                $window.localStorage.setItem(keyName[stateName], JSON.stringify(obj));
            };

            this.openField = function(fields, template) {
                var tmpArr = [];

                if (template) {
                    fields = fields[template];
                }

                for (var k in fields) {
                    if (fields[k].checked) {
                        tmpArr.push(fields[k].value);
                    }
                }
                return tmpArr.join(',');
            };

            this.trans = {
                idCard: {
                    "ucName": "姓名",
                    "ucSex": "性别",
                    "ucNat": "民族",
                    "ucBirth": "出生 / 出生日期",
                    "ucAddress": "住址",
                    "ucNumber": "公民身份号码",
                    "ucIssueUint": "签发机关",
                    "ucValidDate": "有效期限",
                    "isValid": "是否过期",
                    "ChineseName": "中文名",
                    "EnglishName": "英文名",
                    "ChineseNameCode": "中文姓名电报号码",
                    "Sex": "性别",
                    "IDNumber": "公民身份号码",
                    "Birth": "出生年月",
                    "Signal": "标志",
                    "FirstAcquirDate": "第一次领取时间",
                    "RenewalDate": "换发时间"
                },
                creditCard: {
                    "ucCardNum": "银行卡号",
                    "ucBankName": "银行卡名"
                },
                vat: {
                    /*"quantity": "数量",
                    "unitPrice": "单价",
                    "price": "金额",
                    "taxRate": "税率",
                    "taxAmount": "税额",
                    "goodsOrTaxableName": "货物或应税劳务名称",
                    "specificationsModels": "规格型号",
                    "unit": "单位",
                    "date": "开票日期",
                    "invoiceCode": "发票代码",
                    "invoiceNumber": "NO",
                    "totalPrice": "合计金额",
                    "taxTotalPrice": "合计税额",
                    "buyerIdentificationNumber": "购买方纳税人识别号",
                    "sellerIdentificationNumber": "销售方纳税人识别号",
                    "password": "密码区",
                    "totalPriceTaxLowercase": "价税合计（小写）",
                    "buyerName": "购买方名称",
                    "sellerName": "销售方名称",
                    "invoiceArea": "发票区域",
                    "invoiceType": "发票种类",
                    "totalPriceTaxUppercase": "价税合计（大写）",
                    "detail": "明细",
                    "name": "名称",
                    "checkCode": "校验码"*/
                    "InvoiceCode": "发票代码",
                    "InvoiceNumber": "NO",
                    "InvoiceDate": "开票日期",
                    "CheckCode": "校验码",
                    "InvoiceArea": "发票区域",
                    "InvoiceType": "发票类型",
                    "InvoiceTitle": "发票标题",
                    "MachineNumber": "机器编号",
                    "Password": "密码区",
                    "BuyerName": "购买方名称",
                    "BuyerId": "购买方纳税人识别号",
                    "BuyerAddrPhone": "购买方地址电话",
                    "BuyerBankAccount": "购买方开户行账号",
                    "SellerName": "销售方名称",
                    "SellerId": "销售方纳税人识别号",
                    "SellerAddrPhone": "销售方地址电话",
                    "SellerBankAccount": "销售方开户行账号",
                    "TotalPriceTaxUpper": "价税合计（大写）",
                    "TotalPriceTaxLower": "价税合计（小写）",
                    "TotalPrice": "合计金额",
                    "TotalTax": "合计税额",
                    "Remarks": "备注",
                    "Payee": "收款人",
                    "Reviewer": "复核",
                    "Drawer": "开票人",
                    "SellerSeal": "销售方（章）",
                    // 明细
                    "detail": "明细",
                    // 明细子域
                    "GoodsOrTaxableName": "货物或应税劳务名称",
                    "SpecificationsModels": "规格型号",
                    "Unit": "单位",
                    "Quantity": "数量",
                    "UnitPrice": "单价",
                    "Price": "金额",
                    "TaxRate": "税率",
                    "TaxAmount": "税额"
                },
                busLis: {
                    "code": "代码",
                    "validity": "有效期",
                    "registrationNumber": "注册号",
                    "businessLicenseName": "名称",
                    "legalRepresentative": "法定代表人",
                    "legalRepresentativeName": "法定代表人姓名",
                    "registeredCapital": "注册资本",
                    "dateOfEstablishment": "成立日期",
                    "businessLicenseType": "类型",
                    "busnissTerm": "营业期限",
                    "serialNumber": "编号",
                    "OrganizationCodeCertificate": "组织结构代码证",
                    "typeSize": "字号",
                    "typeSizeName": "字号名称",
                    "PermitNumber": "核准号",
                    "proprietorName": "经营者姓名",
                    // "ScopeOfOperators": "经营者范围",
                    "domicile": "住所",
                    "address": "地址",
                    "companyType": "公司类型",
                    "paiclupCapital": "实收资本",
                    "templateType": "版面类型",
                    "socialCreditCode": "统一社会信用代码",
                    "personInCharge": "责任人",
                    "investor": "投资人",
                    "principal": "负责人",
                    "scope": "经营范围",
                    "taxNumber": "税务登记证号"
                }
            };
        }])
        // 文件处理工具集
        .service('FileSrv', ['$window', function($window) {
            /**
             * 文件转 base64
             * @param  {File}   file  File 类型
             * @return {Promise}      返回一个 Promise 对象，调用 then 方法使用回调函数
             * e.g: file2base64(file.files[0]).then(function(res) {
             *     img.src = res;
             * })
             */
            this.file2base64 = function(file) {
                var reader = new FileReader();
                var p = (new Promise(function(resolve, reject) {
                    reader.onload = function() {
                        resolve(reader.result);
                    };
                    if (file) {
                        reader.readAsDataURL(file);
                    }
                }))
                return p;
            };

            /**
             * base64 转文件
             * @param  {String}  str 字符串类型
             * @return {File}        文件类型，文件名随机
             */
            this.base642file = function(str) {
                var bytes = $window.atob(str.split(',')[1]); //去掉url的头，并转换为byte
                //处理异常,将ascii码小于0的转换为大于0
                var ab = new ArrayBuffer(bytes.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < bytes.length; i++) {
                    ia[i] = bytes.charCodeAt(i);
                }
                // 匹配 base64 字符串中的文件类型
                var fileType = /^data\:(.+)\;base64$/.exec(str.split(',')[0])[1];
                return new File([ab], Math.random().toString(36).substr(2) + '.' + fileType.split('/')[1], { type: fileType });
            };
            /**
             * 图片压缩
             * @param  {压缩配置} conf 图片体积尺寸压缩比参数
             * @return {Promise}       返回一个 Promise 对象，调用 then 方法使用回调函数,调函数接收一个 File 对象
             * e.g: imgCompress({
             *     file: file.siles[0],
             *     maxPix: 1920000,
             *     maxByte: 1048576,
             *     cpsRatio: 0.7
             * }).then(function(file) {
             *     ...
             * });
             */
            this.imgCompress = function(conf) {
                // 默认配置
                if (!conf.file) {
                    console.log('文件不存在！');
                }
                // 默认配置
                var defConf = {
                    file: conf.file, // 文件
                    maxPix: conf.maxPix || 1920000, // 图片压缩后的最大像素，默认 200w
                    maxByte: conf.maxByte || 1048576, // 文件最大体积，默认 1M
                    cpsRatio: conf.cpsRatio || 0.7 // 图片压缩比例，默认 70%
                };
                // 记录原始与处理后大小尺寸与压缩比
                var info = {
                    initSize: defConf.file.size, // 初始文件大小
                    initWidth: 0, // 初始宽度
                    initHeight: 0, // 初始高度
                    cpsSize: 0, // 压缩后大小
                    cpsWidth: 0, // 压缩后宽度
                    cpsHeight: 0, // 压缩后高度
                    cpsRatio: '' // 压缩比
                };
                // 初始化 canvas 与 Image
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var img = new Image();
                var reader = new FileReader();

                var p = (new Promise(function(resolve, reject) {
                    // 文件大于限制大小开始压缩
                    if (defConf.file.size > defConf.maxByte) {
                        // 回调函数接收到处理好的 File 对象
                        reader.onload = function() {
                            resolve(new File([reader.result], defConf.file.name, { type: 'image/jpeg' }));
                        };

                        (new Promise(function(resolve, reject) {
                            img.onload = resolve;
                            // 图片地址设为 blob 链接
                            img.src = $window.URL.createObjectURL(defConf.file);
                        }))
                        .then(function() {
                            // 记录原始宽高
                            info.initWidth = img.width;
                            info.initHeight = img.height;
                            // 大于最大像素则压缩尺寸
                            if ((img.width * img.height) > defConf.maxPix) {
                                // 计算压缩后尺寸与原始尺寸的比值
                                var sqrt = Math.sqrt((img.width * img.height) / defConf.maxPix);
                                // 根据比值计算分辨率并记录
                                canvas.width = info.cpsWidth = img.width / sqrt;
                                canvas.height = info.cpsHeight = img.height / sqrt;
                            } else {
                                // 否则不修改尺寸
                                canvas.width = info.cpsWidth = img.width;
                                canvas.height = info.cpsHeight = img.height;
                            }
                            // 将图片以指定宽高比绘制到画布上
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            // 将 canvas 内容转为 blob
                            canvas.toBlob(function(blob) {
                                // 记录转换后的文件体积与压缩比
                                info.cpsSize = blob.size;
                                info.cpsRatio = info.cpsSize / info.initSize;
                                // 打印压缩信息
                                console.log(
                                    '初始文件大小：' + (info.initSize / 1024).toFixed(2) + 'KB\n' +
                                    '初始图片尺寸：' + (info.initWidth).toFixed(2) + 'px * ' + (info.initHeight).toFixed(2) + 'px\n' +
                                    '压缩后文件大小：' + (info.cpsSize / 1024).toFixed(2) + 'KB\n' +
                                    '压缩后图片尺寸：' + (info.cpsWidth).toFixed(2) + 'px * ' + (info.cpsHeight).toFixed(2) + 'px\n' +
                                    '压缩体积比：' + ~~(info.cpsRatio * 100) + '%'
                                );
                                // 将 blob 转为二进制字符串供 File 构造器接收处理
                                reader.readAsArrayBuffer(blob);
                            }, 'image/jpeg', defConf.cpsRatio);
                        });

                    } else {
                        // 仅仅读取文件触发 FileReader 的 onload 事件
                        reader.onload = resolve(defConf.file);

                        console.log('图片未压缩！');

                        reader.readAsDataURL(defConf.file);
                    }
                }));

                // 返回 Promise 对象以供回调函数处理
                return p;
            };
            /**
             * 图片转 base64
             * @param  {Image} img  Image 对象
             * @return {String}     base64 字符串
             * e.g: var base64 = img2base64(document.querySelector('img'));
             */
            this.img2base64 = function(img) {
                var newImg = new Image();
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var p = (new Promise(function(resolve, reject) {
                    newImg.onload = function() {
                        canvas.width = newImg.width;
                        canvas.height = newImg.height;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL());
                    };
                    newImg.src = img.src;
                }));
                return p;
            };
            /**
             * 远程链接转为图片
             * @param  {String} src 链接地址
             * @return {Promise}    返回一个 Promise 对象,调用 then 方法使用回调函数,回调函数接收一个 Image 对象
             * e.g.: src2img('http://test.com/image.jpg')
             * .then(function(img) {
             *     ...
             * });
             */
            this.src2img = function(src) {
                var img = new Image();
                var p = (new Promise(function(resolve, reject) {
                    img.onload = resolve(img);
                    img.src = src;
                }));
                return p;
            };
            /**
             * 远程链接转为 base64
             * @param  {String} src 链接地址
             * @return {Promise}    返回一个 Promise 对象,调用 then 方法使用回调函数,调函数接收一个 base64 字符串
             * e.g.: src2base64('http://test.com/image.jpg')
             * .then(function(base64) {
             *     ...
             * });
             */
            this.src2base64 = function(src) {
                var that = this;
                return this.src2img(src).then(that.img2base64);
            };
            /**
             * 远程链接转为 File 类型
             * @param  {String} src 链接地址
             * @return {Promise}    返回一个 Promise 对象,调用 then 方法使用回调函数,调函数接收一个 File 对象，文件名随机
             * e.g.: src2file('http://test.com/image.jpg')
             * .then(function(base64) {
             *     ...
             * });
             */
            this.src2file = function(src) {
                var that = this;
                return this.src2base64(src)
                    .then(that.base642file);
            };

            /**
             * formData 生成
             * @param  {Object} obj 想要加入 FormData 的数据键值对
             * @return {FormData}     返回的 FormData 对象
             */
            this.formData = function(obj) {
                var formData = new FormData();
                for (var k in obj) {
                    formData.append([k], obj[k]);
                }
                return formData;
            };
            /**
             * canvas 渲染
             * @param  {Object}     要渲染的 canvas 对象
             * @param  {Object}     String 类型，想要渲染到 canvas 的图片 src
             * @return {FormData}   无
             */
            this.canvasRender = function(canvas, src) {
                var img = new Image();
                img.onload = function() {
                    var ctx = canvas.getContext('2d'),
                        canvasWidth = canvas.width,
                        canvasHeight = canvas.height,
                        canvasWHProp = canvasWidth / canvasHeight,
                        imgWidth = img.width,
                        imgHeight = img.height,
                        pixel = imgWidth * imgHeight,
                        imgRenderWidth = img.width,
                        imgRenderHeight = img.height,
                        imgWHProp = imgWidth / imgHeight,
                        x = 0,
                        y = 0,
                        width = imgWidth,
                        height = imgHeight;

                    if (canvasWidth < imgWidth || canvasHeight < imgHeight) {
                        // 画布比图片小，进行缩放
                        if (canvasWHProp > imgWHProp) {
                            // 图片比例比 canvas 高，使图片高 100% ，宽度缩放
                            imgRenderHeight = canvasHeight;
                            imgRenderWidth = imgWidth * imgRenderHeight / imgHeight;
                        } else {
                            // 图片比例比 canvas 宽，使图片宽 100% ，高度缩放
                            imgRenderWidth = canvasWidth;
                            imgRenderHeight = imgHeight * imgRenderWidth / imgWidth;
                        }
                    }
                    // 定位图片
                    x = (canvasWidth - imgRenderWidth) / 2;
                    y = (canvasHeight - imgRenderHeight) / 2;
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                    // 大于 1 百万像素进行瓦片绘制
                    if (pixel > 1000000) {
                        // 计算要分成多少块瓦片
                        var count = ~~(Math.sqrt(pixel / 1000000) + 1);
                        // 计算每块瓦片的宽和高
                        var nw = imgWidth / count;
                        var nh = imgHeight / count;
                        var nrw = imgRenderWidth / count;
                        var nrh = imgRenderHeight / count;

                        // console.log('图片分块像素：' + nw * nh + 'px\n' + '画布分块渲染像素：' + nrw * nrh + 'px');

                        for (var i = 0; i < count; i++) {
                            for (var j = 0; j < count; j++) {
                                // drawImage(图像, 图实际开始x, 图实际开始y, 图片实际剪切宽, 图片实际剪切高, 画布开始x, 画布开始y, 图片缩放宽, 图片缩放高)
                                ctx.drawImage(img, i * nw, j * nh, nw, nh, x + i * nrw, y + j * nrh, nrw, nrh);
                            }
                        }
                        console.log('大尺寸图片，使用瓦片绘制');
                    } else {
                        ctx.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, imgRenderWidth, imgRenderHeight);
                    }
                };

                img.src = src;
            };
        }])
        .service('NetSrv', ['$rootScope', '$http', '$window', 'UI', 'Texts', function($rootScope, $http, $window, UI, Texts) {
            /**
             * 对象转为 queryString
             * @param  {Object} obj 对象类型
             * @return {String}     字符串类型，格式：a=1&b=2&c=3
             */
            this.obj2QStr = function(obj) {
                if (typeof obj !== 'object') {
                    return;
                } else {
                    var tmpArr = [];
                    for (var k in obj) {
                        var subTmpArr = [];
                        subTmpArr.push(encodeURIComponent(k));
                        subTmpArr.push('=');
                        subTmpArr.push(encodeURIComponent(obj[k]));
                        tmpArr.push(subTmpArr.join(''));
                    }
                    return tmpArr.join('&');
                }
            };
            /**
             * 通用 Ajax 流程
             * @param  {Object} conf 配置，包含请求地址，要发送的数据，数据处理程序
             * e.g: {
                    url: '/upload', // url ,必要
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },  // 请求头，非必要
                    data: data,     // 发送的数据，非必要
                    processor: function(data){ // 数据处理程序，非必要
                        ...
                    },
                    fail: function() { // 错误处理程序，非必要
                        ...
                    },
                    failAlert: true, // 弹出错误消息，非必要，默认不提示
                    // cache: true, // 是否启用缓存，如果启用，则缓存获取的数据，非必要，默认不缓存
                    spinner: false // 开启在如动画，默认开启
                }
             */
            // ajax 缓存对象
            // this.ajaxCache = {};
            this.ajaxFw = function(conf) {
                if (!conf.url || !conf.data) {
                    return;
                }
                // 如果开启缓存，先从缓存里寻找数据
                // console.log(conf);
                if (conf.cache) {
                    return;
                }
                $rootScope.spinnerShow = (conf.spinner === false) ? false : true;

                $http({
                        method: 'POST',
                        url: conf.url,
                        headers: conf.headers || {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        data: conf.data
                    })
                    .then(function(res) {
                        if (res.data) {
                            var data = JSON.parse(res.data);
                            if (data && data.mpRecognition.resCd === '00000') {
                                conf.processor && conf.processor(data);
                            } else if (data && data.mpRecognition.resCd !== '00000') {
                                // 数据状态非成功时的动作
                                conf.fail && conf.fail(data);
                            }
                            // 隐藏载入圈
                            $rootScope.spinnerShow = false;
                        }
                    }, function(e) {
                        // 弹出网络状态类型错误
                        if (e.status === -1) {
                            UI.modalAlert({
                                title: '错误',
                                content: '数据请求失败，请检查网络连接。'
                            });
                        }
                        $rootScope.spinnerShow = false;
                    });
            };
        }])
        // 字符串处理工具集
        .service('DataSrv', [function() {
            /**
             * 生成 UUID
             * @param  {[type]} len [description]
             * @return {String}     UUID 字符串
             */
            this.uuid = function(len) {
                var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split('');
                var uuid = [],
                    i;
                var radix = chars.length;

                if (len && !isNaN(len)) {
                    for (i = 0; i < len; i++) {
                        uuid[i] = chars[0 | Math.random() * radix]
                    }
                } else {
                    var r;
                    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                    uuid[14] = '4';
                    for (i = 0; i < 36; i++) {
                        if (!uuid[i]) {
                            r = 0 | Math.random() * radix;
                            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
                        }
                    }
                }
                return uuid.join('');
            };
            /**
             * 结构处理，生成扁平对象，使数组下的对象下的属性上升
             * [{key: val}, {key1: val1}] => {key: val, key1: val1}
             * 
             * @param  {Object}  input 要处理的对象
             * @param  {Boolean} dymic 是否为动态值，true 将用 getter、setter 在原始值上读写，false 则为简单重建
             * @return {Object}        处理后的扁平对象
             */
            this.dataFlat = function(input, dymic) {
                var output = {};
                // 处理数据结构 [{key1: val1}, {key2: val2}] => {key1: val1, key2: val2}
                for (var i = 0; i < input.length; i++) {
                    for (var k in input[i]) {
                        if (dymic) {
                            // 动态，执行自调用函数，闭包中保存当前遍历上下文，动态读写目标对象
                            (function() {
                                var _i = i, _k = k, _input = input, _output = output;
                                Object.defineProperty(_output, k, {
                                    get: function() {
                                        return _input[_i][_k];
                                    },
                                    set: function(val) {
                                        _input[_i][_k] = val;
                                    }
                                })
                            })()
                        } else {
                            // 静态，简单赋值，减少内存消耗
                            output[k] = input[i][k];
                        }
                    }
                }
                return output;
            };
            /**
             * 单层对象转表格
             * @param  {Object}       输入的对象，对象属性必须都为值类型
             * @return {String}       结果表格字符串
             */
            this.obj2tabRec = function(obj) {
                var output = ['<table class="table table-striped table-responsive table-hover"><tbody>'];
                for (var k in obj) {
                    output.push('<tr>');
                    output.push('<td>');
                    output.push('"_$_一_f_"');
                    output.push(k);
                    output.push('"_$_一_f_"');
                    output.push('</td>');
                    output.push('<td>');
                    output.push(obj[k]);
                    output.push('</td>');
                    output.push('</tr>');
                }
                output.push('</tbody></table>')
                return output.join('');
            };
            /**
             * json 转表格
             * @param  {Object} obj JSON.parse 后的数据对象
             * @return {String}     html 表格字符串
             */
            this.json2table = function(obj) {
                var table = obj.table;
                var tableRow = table.tableRow;
                var html = ['<table class="table table-striped"><tbody>'];
                for (var i = 0; i < tableRow.length; i++) {
                    html.push['<tr>'];
                    var tableItemList = tableRow[i].tableItem
                    for (var j = 0; j < tableItemList.length; j++) {
                        var value = tableItemList[j].value;
                        html.push('<td>');
                        html.push(value);
                        html.push('</td>');
                    }
                    html.push('</tr>');
                }
                html.push('</tbody></table>');
                return html.join('');
            };
            /**
             * 扁平的对象转表格
             * @param  {Object} obj 只有一层的对象
             * @return {String}     转换之后的 html 字符串
             */
            this.flatobj2table = function(obj) {
                var html = ['<table class="table table-striped"><tbody>'];
                for (var k in obj) {
                    html.push('<tr>');
                    html.push('<td>');
                    html.push(k);
                    html.push('</td>');
                    html.push('<td>');
                    html.push(obj[k]);
                    html.push('</td>');
                    html.push('</tr>');
                }
                html.push('</tbody></table>');
                return html.join('');
            };
            /**
             * json 转无序列表
             * 被转换的文本需要转译
             * @param  {Object} obj JSON.parse 后的数据对象
             * @return {String}     html 无序列表字符串
             */
            this.json2list = function(obj) {
                var html = [];

                function recursionObj(obj) {
                    if (typeof obj === 'string') {
                        html.push('<span>');
                        html.push(obj);
                        html.push('</span>');
                    } else if (obj instanceof Array) {
                        html.push('<ul class="arr">');
                        for (var i = 0; i < obj.length; i++) {
                            html.push('<li>');
                            recursionObj(obj[i]);
                            html.push('</li>');
                        }
                        html.push('</ul>');
                    } else if (typeof obj === 'object') {
                        html.push('<ul class="obj">');
                        for (var k in obj) {
                            html.push('<li>');
                            html.push('"_$_一_f_"');
                            html.push(k);
                            html.push('"_$_一_f_"：');
                            recursionObj(obj[k])
                            html.push('</li>');
                        }
                        html.push('</ul>');
                    }
                }
                recursionObj(obj);
                return html.join('');
            };
            /**
             * 文字替换
             * @param  {String} str      字符串类型，需要替换的文字
             * @param  {Object} transObj 对象类型，包含要替换的文本与替换文本键值对
             * @return {String}          字符串
             */
            this.textTrans = function(str, transObj) {
                for (var k in transObj) {
                    var keyName = '"\\_\\$\\_一\\_f\\_"' + k + '"\\_\\$\\_一\\_f\\_"';
                    var reg = new RegExp(keyName, 'g');
                    var rId = new RegExp('"\\_\\$\\_一\\_f\\_"', 'g');
                    str = str.replace(reg, transObj[k]);
                }
                str = str.replace(rId, '');
                return str;
            };


            this.objTrans = function(obj, transObj) {
                var that = this;
                return that.textTrans(that.obj2tabRec(obj), transObj);
            };
        }])
        .service('UI', ['$rootScope', '$timeout', function($rootScope, $timeout) {
            this.modalAlert = function(conf) {
                if (!$rootScope.modal) {
                    $rootScope.modal = {};
                }
                var defConf = {
                    size: conf.size ? 'modal-' + conf.size : '',
                    title: conf.title ? conf.title : '提示信息',
                    content: conf.content ? conf.content : '',
                    footer: conf.footer === false ? false : true
                };
                $rootScope.modal.alert = defConf;
                $timeout(function() {
                    $('#modalAlert').modal();
                }, 1000, false);
            };

            // 浮动通知             内容    销毁时间 显示延迟
            this.toast = function(content, time, delay) {
                var toast = $('<div class="toast">' + (content || '') + '</div>').appendTo(document.body)
                content = content || '';
                time = time || 3000;
                delay = delay || 0;
                window.setTimeout(function() {
                    toast.css('opacity', 1);
                }, delay);
                window.setTimeout(function() {
                    toast.css('opacity', 0);
                    toast.one('transitionend', function() {
                        toast.remove();
                    });
                }, time + delay);
            };

        }]);
})(window.angular);