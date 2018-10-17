(function(angular) {
    var mpsSrvs = angular.module('mpsSrvs', [])
        // 接口 URL
        .service('Api', [function() {
            this.host = '//' + window.location.host;
            // 线上
            // this.host = '//r.micropattern.com';
            // 开发
            // this.host = '//10.6.5.63:8099';
            // 测试
            // this.host = '//10.2.34.68:8001';
            // 测试
            // this.host = '//10.2.34.62:8001';
            // 熊峰
            // this.host = '//10.2.33.55:8080';
            // 林莉
            // this.host = '//10.2.33.27:8082';
            // 开发公网
            // this.host = '//59.172.153.82:8001';
            // 裴瑶瑶
            // this.host = '//10.2.33.38:8080';
            // this.host = '';
            // this.host = ['/', '/', window.location.host].join('');
            // 登录相关 API
            this.loginStatus = this.host + '/app/getLoginStatus';
            this.sysParams = this.host + '/app/getSysParams';
            this.loginPage = this.host + '/mycenter/index.html#/account/login';
            // this.login = this.host + '/mycenter/sign_in';
            this.registPage = this.host + '/mycenter/index.html#/account/regist';
            this.regist = this.host + '/app/register';
            this.login = this.host + '/app/login';
            this.logout = this.host + '/app/logout';
            // 算法演示相关封装接口
            this.face = this.host + '/platform/faceone';
            this.idCard = this.host + '/platform/idcard';
            this.creditCard = this.host + '/platform/bankocr';
            this.vat = this.host + '/platform/invoiceocr';
            this.finSta = this.host + '/platform/finstatementocr';
            this.busLis = this.host + '/platform/filedocr';
            this.fullText = this.host + '/platform/fullTextocr';
            this.silentLive = this.host + '/platform/livenessVerify';
            this.handwrittenSignature = {
                recognition: this.host + '/platform/signatureocr',
                verification: this.host + '/platform/signatureVerify'
            };
            this.socialSecurityCard = this.host + '/platform/socialSecurityCard';
            this.trainTicket = this.host + '/platform/trainTicket';
            // 获取增值税验真 ApiKey
            this.getVatKey = this.host + '/usercenter/reqUserApiKey/getApiKeyOfAddedTax';
            // 增值税验真人工干预
            this.vatCheck = this.host + '/api/v2/auth/valueAddedTaxInvoice';
            // 增值税导出为 Excel
            this.vat2Excel = this.host + '/platform/exportAddedTaxInfo';
            // 获取营业执照验真 ApiKey
            this.getBusLisKey = this.host + '/usercenter/reqUserApiKey/getApiKeyOfEntBasicInfo';
            // 营业执照信息查询
            this.busLisQuery = this.host + '/api/v2/auth/entBaseInfo';
            // 原生识别接口
            this.ocr = this.host + '/micropatternImageRecognition/serviceAlgForFile';
            // 批量识别
            // this.batch = this.host + '/platform/batch/serviceForFile';
            // 助账宝查询 WebSocket 接口
            this.helpAccountQueryWS = { 'http:': 'ws:', 'https:': 'wss:' }[window.location.protocol] + this.host + '/webSocketServer';
            // 助账宝调用接口
            this.helpAccountCall = this.host + '/platform/accountantocr';
            // 助账宝申请(发送邮件)
            this.applySubmit = this.host + '/mycenter/mpRiskStrategy/sendEmail';
            // 价格相关 API
            this.price = {
                imageStorage: this.host + '/app/getImageFeeList',
                feesPerTime: this.host + '/app/getFeesListAll?feesType=1',
                feesPerMonth: this.host + '/app/getFeesListAll?feesType=2',
                feesPerYear: this.host + '/app/getFeesListAll?feesType=3'
            };
        }])
        .service('Texts', ['$state', '$window', function($state, $window) {
            // 演示台各服务的描述文案与资源路径
            this.demoTexts = {
                'face': {
                    banner: {
                        enable: true,
                        image: 'images/demo/face/banner.jpg',
                        title: '人脸识别',
                        content: '在创建个体、增加人脸的基础上建立人脸库，通过分析面部特征计算两张人脸的相似度，自动进行身份鉴别，判断是否为同一个人。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/face/introduction_1.png',
                                title: '人脸检测',
                                content: '精准定位图中人脸，获得眼口鼻等 72 个关键点位置，分析性别、年龄、表情等多种人脸属性。'
                            },
                            {
                                image: 'images/demo/face/introduction_2.png',
                                title: '人脸对比 1：1',
                                content: '对比两张人脸的相似度，并给出相似度评分，从而判断是否同一个人。'
                            },
                            {
                                image: 'images/demo/face/introduction_3.png',
                                title: '人脸比对 1：N',
                                content: '对比多张人脸的相似度，并给出相似度评分，从而在人群中找到一个人。'
                            }
                        ]
                    },
                    advantage: { enable: false },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/face/scene_1.png',
                                title: '用户 - 远程身份核实',
                                content: '银行或证券公司，实现远程开户。通过摄像头检测是否为活体，使用深度学习算法，不需要用户配合动作，可以有效规避保险欺诈等。'
                            },
                            {
                                image: 'images/demo/face/scene_2.png',
                                title: 'APP - 实名验证',
                                content: '如约车，在线教育等，通过在线人脸核身服务，可以准确核实确认本人信息后提供服务，约束和减少冒名事件发生。'
                            },
                            {
                                image: 'images/demo/face/scene_3.png',
                                title: '市政 - 证件办理',
                                content: '身份证补办、居住证申领、出入境证件申领等业务，原本繁琐费时的窗口业务办理，转为线上自助办理（如制卡），提升市政的办理效率。'
                            },
                            {
                                image: 'images/demo/face/scene_4.png',
                                title: '安防 - 实名认证',
                                content: '如酒店入住，考试现场等通过一体机进行活体检测和身份验证，可以秒级确认用户的身份是否真实有效。在人口密集的场所，进行身份核验，快速甄别是否有在逃犯人以及重点监控人员，减少安全隐患。'
                            },
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'idCard': {
                    banner: {
                        enable: true,
                        image: 'images/demo/idCard/banner.jpg',
                        title: '身份证识别',
                        content: '支持内地，香港居民身份证正反面识别，所有字段识别。处理倾斜、暗光、曝光、阴影等异常情况稳定性好，数字识别准确率高。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/idCard/introduction_1.png',
                                title: '两种身份证识别',
                                content: '根据内地二代身份证和香港居民身份证的不同，可分类识别信息。'
                            },
                            {
                                image: 'images/demo/idCard/introduction_2.png',
                                title: 'OCR 文字识别',
                                content: '识别所有字段，姓名、性别、出生日期、民族、身份证号等信息。支持智能识别成为可编辑的文本。'
                            },
                            {
                                image: 'images/demo/idCard/introduction_3.png',
                                title: '正反面识别',
                                content: '支持身份证正反面识别，可识别证件上的所有图像。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '实际业务中应用广',
                                content: '结合人脸检测、人脸对比、活体检测、图片识别、可精准识别证件上的文字信息，减少用户的手工录入，节省人力、提升效率。',
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: 'OCR 识别',
                                content: '您是否担心过长的证件号码会导致输入错误？文字内容智能识别成为可编辑的文本。降低用户身份验证错误。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/face/scene_1.png',
                                title: '远程实名核验',
                                content: '银行、保险、证券公司实现远程开户，学生的身份在线教育，远程人脸核身，考试入场等，核实身份对接，进行校验，加快实名验证开户速度，有效规避欺诈等。'
                            },
                            {
                                image: 'images/demo/face/scene_2.png',
                                title: '线上 APP 实名注册',
                                content: '异地合同签署的公司使用电子合同的行业（如网贷、保险等应用），线上实名注册的 APP 应用进行身份证录入，结合人脸比对，活体检测等通过识别身份证信息验证是否是本人。'
                            },
                            {
                                image: 'images/demo/face/scene_3.png',
                                title: '市政身份确认办理',
                                content: '居住证申领、出入境证件申领等业务，原本繁琐费时的窗口业务办理，转为线上自助办理（如制卡），提升市政的办理效率。'
                            },
                            {
                                image: 'images/demo/face/scene_4.png',
                                title: '线下安防身份核验',
                                content: '如酒店、物流签收、实名签到，安防进出检出身份等进行身份识别、核实。共同实现低成本、低风险、高效率的安防核验。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'socialSecurityCard': {
                    banner: {
                        enable: true,
                        image: 'images/demo/socialSecurityCard/banner.jpg',
                        title: '社保卡识别',
                        content: '社保卡 OCR 识别，将识别后的图片以及文字信息，精确地传送到指定的业务系统，便于业务人员快速高效的办理相关业务。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/socialSecurityCard/introduction_1.png',
                                title: '移动端高效录入识别',
                                content: '服务器支持 Windows、Linux，移动端支持 Android、iOS，移动端可直接下载相关 APP 或集成 SDK，占用空间小，同时可以离线识别。'
                            },
                            {
                                image: 'images/demo/socialSecurityCard/introduction_2.png',
                                title: '智能识别方式',
                                content: '采集图像时支持 360 度自动旋转，支持提取证件照片，自动裁切和校正、裁切采集，支持全国各地区的社保卡识别。'
                            },
                            {
                                image: 'images/demo/socialSecurityCard/introduction_3.png',
                                title: 'OCR 识别信息全面',
                                content: '只需通过手机摄像头对证件信息进行采集，便可快速进行扫描识别，并输出识别结果。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '识别稳定精度高',
                                content: '智能移动终端的特殊算法处理倾斜、暗光、曝光、阴影等异常情况稳定性好，数字识别准确率高。',
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: '实际业务中应用广',
                                content: '在各个行业都需要对社保卡识别，如航空 、银行、信用社、保险、医院等地方办理手续和业务时，常需要录入社保卡信息。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/face/scene_1.png',
                                title: '快速采集识别',
                                content: '航空、银行、信用社、保险、医院等地方办理手续和业务时，采集拍照，录入识别社保卡图片，只需提供社保卡 OCR 识别信息。'
                            },
                            {
                                image: 'images/demo/face/scene_2.png',
                                title: '移动端绑定',
                                content: '适用于实名绑定 APP 应用，给用户提供方便、快捷的方法查看社保医保相关信息。建立录入查询系统，为社保中心分流咨询服务的压力，提高效率，节约成本。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'creditCard': {
                    banner: {
                        enable: true,
                        image: 'images/demo/creditCard/creditCard_banner.jpg',
                        title: '银行卡识别',
                        content: '用于医疗、保险理赔业务、期货等行业的移动端自助系统及第三方绑定银行卡、社保卡支付等行业，识别性能处于领先水平。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/creditCard/introduction_1.png',
                                title: '移动端高效录入识别',
                                content: '支持 Android、iOS 平台，用户只需手机摄像头获取卡片图像，识别率高，识别速度小于 0.5 秒。'
                            },
                            {
                                image: 'images/demo/creditCard/introduction_2.png',
                                title: '扫描线智能识别方式',
                                content: '支持多种异形卡，包括平字、凸字、小卡以及竖卡等，可以自动对应卡种类号码整体识别。'
                            },
                            {
                                image: 'images/demo/creditCard/introduction_3.png',
                                title: 'OCR 识别信息全面',
                                content: '自动识别卡名称、类型、卡号、持卡人姓名、到期日期等信息。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '识别稳定精度高',
                                content: '智能移动终端的特殊算法处理倾斜、暗光、曝光、阴影等异常情况稳定性好，数字识别准确率高。',
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: '实际业务中应用广',
                                content: '适用于医疗、证券银行、保险理赔业务等行业的移动端自助开户系统及第三方绑定业务等。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/face/scene_1.png',
                                title: '远程开户',
                                content: '证券、保险理赔业务、期货行业等开户系统实现远程开户，识别银行卡上的卡号比对身份证信息，进行校验，加快实名验证开户速度，有效规避欺诈等。'
                            },
                            {
                                image: 'images/demo/face/scene_2.png',
                                title: '移动端绑定',
                                content: '适用于实名绑卡，移动支付绑卡、直销银行等手机金融业务。上传银行卡图片通过识别银行卡，快速获取信息完成查看、转账等功能。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'vat': {
                    banner: {
                        enable: true,
                        image: 'images/demo/vat/banner.jpg',
                        title: '增值税发票识别',
                        content: '针对增值税专用发票、普通发票通过专业扫描仪采集发票影像，利用 OCR 识别技术，对发票识别，查验真伪，并自动快速识别提取票面相关信息。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/vat/introduction_1.png',
                                title: '扫描上传增值税发票',
                                content: '选择上传图片，或扫描二维码识别。支持增值税普通发票、增值税专用发票和增值税电子发票识别，支持 PNG、JPG、BMP、PDF 格式。'
                            },
                            {
                                image: 'images/demo/vat/introduction_2.png',
                                title: 'OCR 识别',
                                content: '可设置该票的代码、号码、日期、税额、税价总额等识别信息，智能化的图像处理功能，完成影像的倾斜校正、裁剪、旋转、去白页、加框等功能。'
                            },
                            {
                                image: 'images/demo/vat/introduction_3.png',
                                title: '提供发票验真业务',
                                content: '可选择识别加入验真服务，反馈真伪。实现单据影像信息的传递、接收，精准识别文字信息。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '提供验真服务',
                                content: '发票 OCR 识别并导出增票信息后，批量联网进行增票查验，检查是否真票、错票或冲红。批量验真准确率高。',
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: 'OCR 识别域设置',
                                content: 'OCR 识别智能设置票据识别模板，系统可以与企业不同的业务系统做高度的系统集成。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/vat/scene_1.png',
                                title: '税务认证',
                                content: '用于认证部分信息项，部分有用的信息不能识别。采集增值税发票信息，并形成电子档上传税务认证系统，进行税务认证。'
                            },
                            {
                                image: 'images/demo/vat/scene_2.png',
                                title: '票据归档',
                                content: '如跨国企业还存在一些国外供应商的外币发票需要识别，需要集中归档管理。结构化数据导出，方便票据信息的归档。'
                            },
                            {
                                image: 'images/demo/vat/scene_3.png',
                                title: '供应商管理',
                                content: '基于采购订单增值税发票上单张发票含有多个采购订单都有多个行项目，为供应商管理提供增值税发票识别，减少人工检查成本。'
                            },
                            {
                                image: 'images/demo/vat/scene_4.png',
                                title: '报销管理',
                                content: '发票量巨大，需要大量的人员对发票上的重要信息进行录入到 ERP 或其它系统中，大大提高员工的工作效率及财务数据录入的准确性。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'finSta': {
                    banner: {
                        enable: true,
                        image: 'images/demo/finSta/banner.jpg',
                        title: '财务报表识别',
                        content: 'OCR 识别财务报表替代繁重的人工录入工作，构建自动化的财务审核业务系统，缩减人力成本、控制数据风险、提高办公效率。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/finSta/introduction_1.png',
                                title: '上传或扫描财务报表',
                                content: '支持手机拍摄或通过计算机快速上传报表样本，极大提高数据采集的效率和准确度。'
                            },
                            {
                                image: 'images/demo/finSta/introduction_2.png',
                                title: 'OCR 自动分析识别',
                                content: 'OCR 自动分析识别将财务报表上的文字、表格、图像转化为电子版数据，无需设定识别模板。'
                            },
                            {
                                image: 'images/demo/finSta/introduction_3.png',
                                title: '支持导出识别结果',
                                content: '实现财报信息的传递、识别结果支持导出 Excel 表格，适合银行，税务等行业大量票据表格的长期存储。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '识别数据精度高',
                                content: '支持批量识别，识别一页报表平均耗时 2 秒，导出报表信息后，可进行识别查验，自动分析以及匹配规则达到准确识别的目的。',
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: '导出识别结果',
                                content: '报表识别结果，电脑随时随地查看，还可一键导出，可校验打印，轻松处理财务分析工作。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/vat/scene_1.png',
                                title: '银行，企业单位',
                                content: '帮助银行等部门构建目动化的财务审核业务系统，缩减人力成本、控制数据风险、提高办公效率、扩大业务经营、提升客户满意度。'
                            },
                            {
                                image: 'images/demo/vat/scene_2.png',
                                title: '财务审计部门',
                                content: '全面系统地揭示企业一定时期的财务状况、经营成果和现金流、税务、工商、审计等部门监督企业经营管理。'
                            },
                            {
                                image: 'images/demo/vat/scene_3.png',
                                title: '供应商管理',
                                content: '基于采购订单增值税发票上单张发票含有多个采购订单并且毎个采购订单都有多个行项目，为供应商管理提供增值税发票识別，减少人工检查成本。'
                            },
                            {
                                image: 'images/demo/vat/scene_4.png',
                                title: '报销管理',
                                content: '发票量巨大，需要大量的人员对发票上的重要信息进行录入到 ERP 或者其他系统中，大大提高员工的工作效率及财务数据录入的准确性。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'busLis': {
                    banner: {
                        enable: true,
                        image: 'images/demo/busLis/banner.jpg',
                        title: '营业执照识别',
                        content: 'OCR 识别引擎可针对营业执照进行识别，高效准确地从营业执照中提取文本信息，并将识别后的信息传送给相关的业务系统提供验真服务。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/busLis/introduction_1.png',
                                title: '手机端采集或上传营业执照',
                                content: '支持手机端采集营业执图片。运用OCR技术快速识别三证信息。可应用于信贷经理拜访企业、平台供应商三证管理等场景。'
                            },
                            {
                                image: 'images/demo/busLis/introduction_2.png',
                                title: 'OCR 识别域设置',
                                content: '可自定义设置识别内容、注册号、法定代表人、公司名称、地址、营业期限等文本结构化、分布式栏位、文本框选结构。'
                            },
                            {
                                image: 'images/demo/busLis/introduction_3.png',
                                title: '提供识别验真',
                                content: '将识别结果导出为各种常见格式。对接权威企业信息数据库验证三证真伪。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: 'OCR 识别域设置',
                                content: '可通过手机拍摄采集营业执照图片。OCR 识别智能设置识别模板，识别率高，可精准识别营业执照的信息 。'
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: '提供验真服务',
                                content: '运用 OCR 技术快速识别三证信息，识别结果对接权威企业信息数据库，提供验证三证真伪服务。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/busLis/scene_1.png',
                                title: '商户认证',
                                content: '在外卖、电商、分类信息网站可以使用营业执照识别帮助商户入驻时进行快速的信息录入，提高输入效率，提升用户体验。'
                            },
                            {
                                image: 'images/demo/busLis/scene_2.png',
                                title: '银行企业开户、贷款',
                                content: '在银行企业开户和贷款的场景下。能够帮助用户快速的录入企业的营业执照信息。'
                            },
                            {
                                image: 'images/demo/busLis/scene_3.png',
                                title: '企业证照审核',
                                content: '识别企业证照信息，减少人工补录，提高对公开户等业务办理效率。'
                            },
                            {
                                image: 'images/demo/busLis/scene_4.png',
                                title: '证照归档',
                                content: '结构化数据导出，自动识别营业执照信息，替代人工手动输入，方便图像信息的归档。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'fullText': {
                    banner: {
                        enable: true,
                        image: 'images/demo/fullText/banner.jpg',
                        title: '全文识别',
                        content: '支持身份证、名片等卡证类和票据类的印刷体文本识别，识别图片中的所有文字信息，并返回文字框位置、文字类型与文字内容。可以有效地代替人工录入信息。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/fullText/introduction_1.png',
                                title: '上传或扫描文档',
                                content: '通过计算机快速采集样本，支持批量上传 ，极大提高数据采集的效率和准确度。'
                            },
                            {
                                image: 'images/demo/fullText/introduction_2.png',
                                title: 'OCR 自动分析识别',
                                content: '文字识别 OCR 可自动从图片中定位并识别字段、表格数据，印刷体的平均准确率可达 80% 以上。'
                            },
                            {
                                image: 'images/demo/fullText/introduction_3.png',
                                title: '识别文本多样化',
                                content: '支持常见的文字识别，包括数字、英文部分繁文等。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的持征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习筲法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '识别数据精度高',
                                content: '支持横向、竖向拍摄，适应透视崎变、光照不均、部分遮挡的情况，具备非常高的复杂环境可用性。'
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: 'OCR 识别定制模板',
                                content: 'OCR 识别智能设罝识別模板，满足财务报表、简历等复杂版面的识别。还原出内容的逻辑结构。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/fullText/scene_1.png',
                                title: '法院文件识別',
                                content: '用于法院纸质文件识别，减少人工输入过程，提高输入效率 。'
                            },
                            {
                                image: 'images/demo/fullText/scene_2.png',
                                title: '资料结构化整理',
                                content: '用于笔记、书籍、档案等资料识别 ，方便您完成大量的资料结构化整理工作'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'silentLive': { customContent: true },
                'handwrittenSignature': {
                    banner: {
                        enable: true,
                        image: 'images/demo/handwrittenSignature/banner.jpg',
                        title: '手写签名识别‧验证',
                        content: '请上传本地图片，体验手写签名识别，通过 OCR 识别、比对、快速验证。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/handwrittenSignature/introduction_1.png',
                                title: '识别纸质手写签名',
                                content: '采用 OCR 识别纸质的毛笔、钢笔任意挑，颜色、笔触粗细自由选的手写签名。'
                            },
                            {
                                image: 'images/demo/handwrittenSignature/introduction_2.png',
                                title: '识別电子签名',
                                content: '识别手写压力及手写签名点坐标的测量，通过此设备得到手写签名的动态特征。'
                            },
                            {
                                image: 'images/demo/handwrittenSignature/introduction_3.png',
                                title: '手写签名比对验真伪',
                                content: '线上线下手写签名上传比对并行，以在纸上签名上传，与已有的签名图片比对，验证签名是否是同一人。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '10 年产品运营经验，海量数据积累，智能识别各类违规图片。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: '标准灵活定制',
                                content: '各行业的使用场景不同，业务流程不同，签名介质不同，风险等级不同，电子签名的解决方案不同也各不相同。'
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: '应用领域广',
                                content: '各行各业，互联网金融、工商税务、安防、教育、物流等。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/handwrittenSignature/scene_1.png',
                                title: '用户-远程签名核实',
                                content: '银行、保险、证券公司实现远程开户，使用数字笔在数位屏上签名、实名认证时，对原笔迹的手写签名数据管理和安全传输后，进行识别、验证。确认签名为本人，有效规避保险欺诈等。'
                            },
                            {
                                image: 'images/demo/handwrittenSignature/scene_2.png',
                                title: '消费类手写签名',
                                content: '对酒店，商场消费确认，物流签收等消费类单据的手写签名，进行原笔迹数据的识别、验证。全程电子化管理和安全传输，共同实现低成本、低风险、高效率的运营。'
                            },
                            {
                                image: 'images/demo/handwrittenSignature/scene_3.png',
                                title: '公文等签署的手写签名',
                                content: '政府的移动执法中的电子签名，医院的电子病历中的电子签名，电子商务中电子合同的电子签名等识别验证确保其文件的不可否认，篡改可査等特性。'
                            },
                            {
                                image: 'images/demo/handwrittenSignature/scene_4.png',
                                title: '各种合同的签署',
                                content: '异地合同签署的公司使用电子合同的行业(如网贷、旅游等)，线上合同签订，协议签订，和以往合同手写签名进行识别保管，最后有争议时候的调用比对，验证其文件的不可否认性。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                },
                'trainTicket': {
                    banner: {
                        enable: true,
                        image: 'images/demo/trainTicket/banner.jpg',
                        title: '火车票识别',
                        content: '针对车票报销管理，快速完成火车票的图片采集。通过 OCR 识别技术，可与政府、企事业单位、工商、等多个行业的业务流程系统无缝结合，提高资料电子化、数据格式化的效率。',
                        button: {
                            enable: true,
                            url: 'download/qrcode.html#1',
                            text: '下载 APP 立即体验',
                            icon: {
                                enable: true,
                                className: 'fa fa-download'
                            }
                        },
                        qrcode: {
                            enable: true,
                            image: 'images/index/qr_MPDetector.png'
                        }
                    },
                    introduction: {
                        enable: true,
                        title: '功能介绍',
                        blocks: [{
                                image: 'images/demo/trainTicket/introduction_1.png',
                                title: '上传火车票',
                                content: '支持安卓 Android、苹果 iOS 等主流移动端操作系统，使用 APP 进入到识别界面，上传火车票进行 OCR 识别，支持 PNG、JPG、BMP 格式。'
                            },
                            {
                                image: 'images/demo/trainTicket/introduction_2.png',
                                title: 'OCR 识别',
                                content: '智能化的图像处理功能，自动识别提取蓝票、红票的信息。发票拍照识别系统，还包括机动车销售发票、火车票、航空行程单等多种票据并可自动分类。'
                            },
                            {
                                image: 'images/demo/trainTicket/introduction_3.png',
                                title: '支持集成到企业 APP 上',
                                content: '如需把识别的火车票信息录入到企业 APP 上，只需要再企业 APP 上嵌入火车票 OCR 识别软件即可。'
                            }
                        ]
                    },
                    advantage: {
                        enable: true,
                        title: '产品优势',
                        blocks: [{
                                image: 'images/demo/idCard/advantage_1.png',
                                title: '海量数据样本',
                                content: '拥有海量的特征样本库，所有识别服务均经过大量数据的学习和实践，智能的深度学习算法也可以通过不断学习使系统变得更智能、更精准。'
                            },
                            {
                                image: 'images/demo/idCard/advantage_2.png',
                                title: 'OCR 车票识别',
                                content: '发票拍照识别系统可以做到和 PC 端发票扫描识别等同的识别准确度。不限于模板识别，可智能分析识别发票信息，录入报销车票，自动统计信息。'
                            }, {
                                image: 'images/demo/idCard/advantage_3.png',
                                title: '企业应用范围广',
                                content: '政府、企事业单位、工商等多个行业的业务流程系统无缝结合，辅助办公人员进行车票等单据的信息录入，推进数据格式化的效率。'
                            }
                        ]
                    },
                    demonstration: {
                        enable: true
                    },
                    scene: {
                        enable: true,
                        title: '应用场景',
                        blocks: [{
                                image: 'images/demo/trainTicket/scene_1.png',
                                title: '企业办公移动端管理',
                                content: '无纸化办公的普及以及大中小型公司建设财务共享中心的需要，将原始票据图片的采集和录入，通过移动端识别提交，代替传统财务发票人工整理、图像采集、录入，提高效率，节省庞大的工作量。'
                            },
                            {
                                image: 'images/demo/trainTicket/scene_2.png',
                                title: '报销管理',
                                content: '发票量巨大，需要大量的人员对大票上的重要信息进行录入到 ERP 或者其他系统中，大大提高员工的工作效率及财务数据集录入的准确性。'
                            }
                        ]
                    },
                    bottomBanner: {
                        enable: true,
                        image: 'images/MPDetector_banner.jpg'
                    }
                }
            };

            // 演示台的占位样本图片与默认结果模板路径
            this.path = {
                face: {
                    // 示例图片
                    exampleImg: ['images/demo/face/example_1.jpg', 'images/demo/face/example_2.jpg'],
                    // 示例结果
                    exampleResult: 'tpls/demo/exampleResult/face.html',
                    // 结果解析模板
                    resolverTpl: 'tpls/demo/resolver/face.html'
                },
                idCard: {
                    exampleImg: 'images/demo/idCard/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/idCard.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/idCard.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/idCard.group.html',
                            item: 'tpls/demo/resolver/multiple/idCard.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/idCard.single.html',
                        multiple: 'tpls/demo/idCard.multiple.html'
                    }
                },
                creditCard: {
                    exampleImg: 'images/demo/creditCard/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/creditCard.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/creditCard.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/creditCard.group.html',
                            item: 'tpls/demo/resolver/multiple/creditCard.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/creditCard.single.html',
                        multiple: 'tpls/demo/creditCard.multiple.html'
                    }
                },
                vat: {
                    exampleImg: 'images/demo/vat/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/vat.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/vat.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/vat.group.html',
                            item: 'tpls/demo/resolver/multiple/vat.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/vat.single.html',
                        multiple: 'tpls/demo/vat.multiple.html'
                    }
                },
                finSta: {
                    exampleImg: 'images/demo/finSta/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/finSta.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/finSta.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/finSta.group.html',
                            item: 'tpls/demo/resolver/multiple/finSta.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/finSta.single.html',
                        multiple: 'tpls/demo/finSta.multiple.html'
                    }
                },
                busLis: {
                    exampleImg: {
                        '12002': 'images/demo/busLis/example_12002.jpg',
                        '12003': 'images/demo/busLis/example_12003.jpg',
                        '12004': 'images/demo/busLis/example_12004.jpg'
                    },
                    exampleResult: {
                        '12002': 'tpls/demo/exampleResult/busLis.12002.html',
                        '12003': 'tpls/demo/exampleResult/busLis.12003.html',
                        '12004': 'tpls/demo/exampleResult/busLis.12004.html'
                    },
                    resolverTpl: {
                        single: 'tpls/demo/resolver/busLis.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/busLis.group.html',
                            item: 'tpls/demo/resolver/multiple/busLis.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/busLis.single.html',
                        multiple: 'tpls/demo/busLis.multiple.html'
                    }
                },
                fullText: {
                    exampleImg: 'images/demo/fullText/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/fullText.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/fullText.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/fullText.group.html',
                            item: 'tpls/demo/resolver/multiple/fullText.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/fullText.single.html',
                        multiple: 'tpls/demo/fullText.multiple.html'
                    }
                },
                handwrittenSignature: {
                    exampleImg: {
                        recognition: 'images/demo/handwrittenSignature/example.jpg'
                    },
                    branch: {
                        recognition: 'tpls/demo/handwrittenSignature.recognition.html',
                        verification: 'tpls/demo/handwrittenSignature.verification.html'
                    }
                },
                socialSecurityCard: {
                    exampleImg: 'images/demo/socialSecurityCard/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/socialSecurityCard.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/socialSecurityCard.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/socialSecurityCard.group.html',
                            item: 'tpls/demo/resolver/multiple/socialSecurityCard.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/socialSecurityCard.single.html',
                        multiple: 'tpls/demo/socialSecurityCard.multiple.html'
                    }
                },
                trainTicket: {
                    exampleImg: 'images/demo/trainTicket/example.jpg',
                    exampleResult: 'tpls/demo/exampleResult/trainTicket.html',
                    resolverTpl: {
                        single: 'tpls/demo/resolver/trainTicket.html',
                        multiple: {
                            group: 'tpls/demo/resolver/multiple/trainTicket.group.html',
                            item: 'tpls/demo/resolver/multiple/trainTicket.item.html'
                        }
                    },
                    branch: {
                        single: 'tpls/demo/trainTicket.single.html',
                        multiple: 'tpls/demo/trainTicket.multiple.html'
                    }
                },
                helpAccount: {
                    resultDataTable: "tpls/solution/helpAccount/resultDataTable.html",
                    detailModal: "tpls/solution/helpAccount/detailModal.html",
                    resultResolver: "tpls/solution/helpAccount/resultResolver.html",
                    allResultDataTable: "tpls/solution/helpAccount/allResultDataTable.html"
                }
            };

            var that = this;
            this.fields = {
                def: {
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
                                value: "organizationCodeCertificate",
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
                },
                getConfig: function() {
                    var stateArr = $state.current.name.split('.');
                    var stateName = stateArr[stateArr.length - 1];
                    var json = $window.localStorage.getItem(stateName + 'Fields');
                    return json ? JSON.parse(json) : that.fields.def[stateName];
                },
                saveConfig: function(obj) {
                    var stateArr = $state.current.name.split('.');
                    var fieldKey = stateArr[stateArr.length - 1] + 'Fields';
                    $window.localStorage.setItem(fieldKey, angular.toJson(obj));
                },
                openField: function(template) {
                    // 营业执照需要区分版面，每个版面数据不同，因此识别域数据结构不同，使用 template 参数取数据
                    var fields = template ? this.getConfig()[template] : this.getConfig();
                    var tmpArr = [];

                    for (var k in fields) {
                        if (fields[k].checked) {
                            tmpArr.push(fields[k].value);
                        }
                    }
                    return tmpArr.join(',');
                }
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
                    "ucBankName": "银行卡名",
                    "validDate": "有效期限"
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
                    "organizationCodeCertificate": "组织结构代码证",
                    "typeSize": "字号",
                    "typeSizeName": "字号名称",
                    "permitNumber": "核准号",
                    "proprietorName": "经营者姓名",
                    "scopeOfOperators": "经营者范围",
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
                },
                socialSecurityCard: {
                    "faceImg": "人脸图像信息（base64编码）",
                    "name": "姓名",
                    "socialSecurityNum": "社会保障号码",
                    "cardNum": "卡号",
                    "accountNum": "金融账户账号",
                    "voucherNum": "凭证号"
                },
                trainTicket: {
                    Name: '姓名',
                    IDNumber: '证件号码',
                    OriginStation: '始发站',
                    TerminalStation: '到达站',
                    Trips: '车次',
                    DepartureTime: '开车时间',
                    SeatNumber: '座位号',
                    SeatLevel: '几等座',
                    Price: '票价',
                    QRResult: '二维码识别结果'
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
                    // 如果是数组，以相同 key 添加各个元素
                    if (obj[k] instanceof Array) {
                        var length = obj[k].length;
                        for (var i = 0; i < length; i++) {
                            formData.append(k, obj[k][i]);
                        }
                    } else {
                        formData.append(k, obj[k]);
                    }
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
                    success: function(data){ // 数据处理程序，非必要
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
                if (!conf.url) {
                    return;
                }

                // conf.spinner === false，则不干涉
                if (conf.spinner !== false) {
                    $rootScope.spinnerShow = true;
                }

                var promise = new Promise(function(resolve, reject) {
                    $http({
                            method: 'POST',
                            url: conf.url,
                            headers: conf.headers || {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            data: conf.data,
                            params: conf.params
                        })
                        .then(function(res) {
                            var data;
                            if (res.data) {
                                if (typeof res.data === 'object') {
                                    data = res.data;
                                } else {
                                    try {
                                        data = JSON.parse(res.data);
                                    } catch (e) {
                                        data = null;
                                    }
                                }
                                if (data) {
                                    conf.success && conf.success(data);
                                    resolve && resolve(data);
                                } else {
                                    // 没有得到数据，关闭载入，弹出消息
                                    $rootScope.spinnerShow = false;
                                    $rootScope.notify.open({
                                        title: '错误',
                                        content: '服务器没有返回预期结果。',
                                        type: 'error'
                                    });
                                }
                                // 隐藏载入圈
                                if (conf.spinner !== false) {
                                    $rootScope.spinnerShow = false;
                                }
                            }
                        }, function(e) {
                            // 弹出网络状态类型错误
                            if (e.status === -1) {
                                $rootScope.notify.open({
                                    title: '错误',
                                    content: '数据请求失败，请检查网络连接。',
                                    type: 'error'
                                });
                            }
                            $rootScope.spinnerShow = false;
                            conf.fail && conf.fail(e);
                            reject && reject(e);
                        });
                });
                return promise;
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
                                var _i = i,
                                    _k = k,
                                    _input = input,
                                    _output = output;
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
            // 弹出模态框
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
                });
            };

            // 浮动通知             内容    销毁时间 显示延迟
            // 20180711: 右上角通知完成以后已废弃
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