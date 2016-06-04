geodash.init_controller_base = function(app)
{
  app.controller("GeositeControllerBase", geodash.controllers.controller_base);
};

geodash.init_controller = function(that, app, controller)
{
  var controllerName = that.data('controllerName') || that.attr('id');

  app.controller(controllerName, controller || geodash.controllers.controller_base);
};

geodash.init_controllers = function(that, app, controllers)
{
  for(var i = 0; i < controllers.length; i++)
  {
    var c = controllers[i];
    $(c.selector, that).each(function(){
        try
        {
          geodash.init_controller($(this), app, c.controller);
        }
        catch(err)
        {
          console.log("Could not load Geosite Controller \""+c.selector+"\"", err);
        }
    });
  }
};
