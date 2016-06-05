geodash.controllers["controller_legend"] = function(
  $scope,
  $element,
  $controller,
  state,
  map_config,
  live)
{
  angular.extend(this, $controller('GeoDashControllerBase', {$element: $element, $scope: $scope}));
  //
  $scope.map_config = map_config;
  $scope.state = state;
  //////////////
  // Watch
  $scope.updateVariables = function(){
    var arrayFilter = $scope.map_config.legendlayers;
    var featurelayers = $.map($scope.map_config.featurelayers, function(item, key){ return {'key': key, 'item': item}; });
    featurelayers = $.grep(featurelayers,function(x, i){ return $.inArray(x["key"], arrayFilter) != -1; });
    featurelayers.sort(function(a, b){ return $.inArray(a["key"], arrayFilter) - $.inArray(b["key"], arrayFilter); });
    $scope.featurelayers = featurelayers;
  };
  $scope.updateVariables();
  $scope.$watch('map_config.featurelayers', $scope.updateVariables);
  $scope.$watch('map_config.legendlayers', $scope.updateVariables);
  $scope.$watch('state', $scope.updateVariables);
  //////////////
  var jqe = $($element);

  $scope.$on("refreshMap", function(event, args){
    console.log('args: ', args);

    $scope.$apply(function()
    {
      $scope.state = args.state;
    });

  });
};
