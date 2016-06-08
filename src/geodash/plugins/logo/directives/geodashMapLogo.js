geodash.directives["geodashMapLogo"] = function(){
  return {
    restrict: 'EA',
    replace: true,
    scope: true,  // Inherit exact scope from parent controller
    templateUrl: 'map_logo.tpl.html',
    link: function ($scope, element, attrs){
    }
  };
};
