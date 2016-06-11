geodash.directives["geodashMapOverlays"] = function(){
  return {
    restrict: 'EA',
    replace: true,
    scope: true,  // Inherit exact scope from parent controller
    templateUrl: 'map_overlays.tpl.html',
    link: function ($scope, element, attrs){

      $scope.styles = function(){

      };

      $(element).on('mouseenter', '.geodash-map-overlay', function(event, args){
        $(this).draggable('enable');
      });

      $(element).on('mouseleave', '.geodash-map-overlay', function(event, args){
        $(this).draggable('disable');
      });

      $scope.$on("overlayLoaded", function(event, args) {
        console.log("overlayLoaded", event, args);
        var container = $(args.element).parents(".geodash-map:first");
        $(args.element).draggable({
          "containment": container,
          start: function(event, args) {

          },
          drag: function(event, args) {

          },
          stop: function(event, args) {
            console.log(event, args);
            var newPosition = args.position;
            var overlayIndex = $(this).data('overlay-index');
            var scope = geodash.api.getScope("geodash-sidebar-right");
            if(scope != undefined)
            {
              var mapWidth = container.width();
              var mapHeight = container.height();

              scope.map_config_flat["overlays__"+overlayIndex+"__top"] = newPosition.top < (mapHeight / 2.0) ? newPosition.top+'px' : 'auto';
              scope.map_config_flat["overlays__"+overlayIndex+"__bottom"] = newPosition.top >= (mapHeight / 2.0) ? (mapHeight - newPosition.top)+'px' : 'auto';
              scope.map_config_flat["overlays__"+overlayIndex+"__left"] = newPosition.left < (mapWidth / 2.0) ? newPosition.left+'px' : 'auto';
              scope.map_config_flat["overlays__"+overlayIndex+"__right"] = newPosition.left >= (mapWidth / 2.0) ? (mapWidth - newPosition.left)+'px' : 'auto';

              setTimeout(function(){
                scope.validateFields([
                  "overlays__"+overlayIndex+"__top",
                  "overlays__"+overlayIndex+"__bottom",
                  "overlays__"+overlayIndex+"__left",
                  "overlays__"+overlayIndex+"__right"
                ])
              }, 0);
            }
          }
        });
      });
    }
  };
};
