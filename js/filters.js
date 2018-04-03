(function(angular) {
    var mpsFilters = angular.module('mpsFilters', [])
    // 信任表单 url 过滤器
    .filter('trusted', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        }
    }]);
})(window.angular);