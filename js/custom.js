(function($) {
    // 二级导航固定
    /*$(window).on('scroll', function() {
        if ($('.tab-tits')[0] && $(window).scrollTop() > $('.mps-navbar').height()) {
            $('.tab-tits').addClass('fixed');
            $('body').css('marginTop', $('.mps-navbar').height() + 'px');
        } else {
            $('.tab-tits').removeClass('fixed');
            $('body').css('marginTop', '');
        }
    });*/
    // canvas 宽高占满父容器
    /*$(window).on('resize', function() {
        $('.demo canvas').prop('width', $('.demo canvas').parent().width()).prop('height', $('.demo canvas').parent().height());
    });*/
})(window.jQuery);