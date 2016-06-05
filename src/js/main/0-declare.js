var geodash = {
  'init': {},
  'directives': {},
  'controllers': {},
  'filters': {},
  'vecmath': {},
  'tilemath': {},
  'api': {},
  'listeners': {}
};

geodash.init.listeners = function()
{
  $('body').on('click', '.btn-clear', function(event) {
    var selector = $(this).data('clear');
    $(selector).each(function(){
      var input = $(this);
      input.val(null);
      // Update Typeahead backend if exists
      if(input.data('backend') != undefined)
      {
        var backend = $('#'+input.data('backend'));
        backend.val(null);
        backend.trigger('input');
        backend.change();
      }
    });
  });

  $('body').on('click', '.geodash-intent', function(event) {
    event.preventDefault();  // For anchor tags
    var that = $(this);
    var scope = angular.element('[ng-controller='+that.data('intent-ctrl')+']').scope();
    if(that.hasClass('geodash-toggle'))
    {
      if(that.hasClass('geodash-off'))
      {
        that.removeClass('geodash-off');

        geodash.api.intend(that.data('intent-names')[0], that.data('intent-data'), scope);
      }
      else
      {
        that.addClass('geodash-off');
        geodash.api.intend(that.data('intent-names')[1], that.data('intent-data'), scope);
      }
    }
    else if(that.hasClass('geodash-radio'))
    {
      var siblings = that.parents('.geodash-radio-group:first').find(".geodash-radio").not(that);
      if(!(that.hasClass('geodash-on')))
      {
        that.addClass('geodash-on');
        if(that.data("intent-class-on"))
        {
          that.addClass(that.data("intent-class-on"));
          siblings.removeClass(that.data("intent-class-on"));
        }
        siblings.removeClass('geodash-on');
        if(that.data("intent-class-off"))
        {
          that.removeClass(that.data("intent-class-off"));
          siblings.addClass(that.data("intent-class-off"));
        }
        geodash.api.intend(that.data('intent-name'), that.data('intent-data'), scope);
      }
    }
    else
    {
      geodash.api.intend(that.data('intent-name'), that.data('intent-data'), scope);
    }
  });
};

geodash.api.welcome = function(options)
{
  options = options || {};
  var scope = options['$scope'] || options['scope'] || angular.element("#geodash-main").scope();
  var intentData = {
    "id": "geodash-modal-welcome",
    "dynamic": {},
    "static": {
      "welcome": scope.map_config["welcome"]
    }
  };
  geodash.api.intend("toggleModal", intentData, scope);
};

/**
 * Used for intents (requesting and action), such as opening modals, zooming the map, etc.
 * @param {string} name of the intent (toggleModal, refreshMap, filterChanged)
 * @param {object} JSON package for intent
 * @param {object} Angular Scope object for emiting the event up the DOM.  This should correspond to an element's paranet controller.
*/
geodash.api.intend = function(name, data, scope)
{
  scope.$emit(name, data);
};


geodash.assert_float = function(x, fallback)
{
  if(x === undefined || x === "")
  {
    return fallback;
  }
  else if(angular.isNumber(x))
  {
    return x;
  }
  else
  {
    return parseFloat(x);
  }
};

geodash.assert_array_length = function(x, length, fallback)
{
  if(x === undefined || x === "")
  {
    return fallback;
  }
  else if(angular.isString(x))
  {
    x = x.split(",");
    if(x.length == length)
    {
      return x;
    }
    else
    {
      return fallback;
    }
  }
  else if(angular.isArray(x))
  {
    if(x.length == length)
    {
      return x;
    }
    else
    {
      return fallback;
    }
  }
};

geodash.api.opt = function(options, names, fallback, fallback2)
{
  if(options != undefined)
  {
    if($.isArray(names))
    {
      var value = undefined;
      for(var i = 0; i < names.length; i++)
      {
        value = options[names[i]];
        if(value != undefined)
            break;
      }
      return value || fallback || fallback2;
    }
    else
        return options[names] || fallback ||  fallback2;
  }
  else
      return fallback || fallback2;
};
geodash.api.opt_i = function(options, names, fallback)
{
  return geodash.api.opt(options, names, fallback, 0);
};
geodash.api.opt_s = function(options, names, fallback)
{
  return geodash.api.opt(options, names, fallback, "");
};
geodash.api.opt_b = function(options, names, fallback)
{
  return geodash.api.opt(options, names, fallback, false);
};
geodash.api.opt_j = function(options, names, fallback)
{
  return geodash.api.opt(options, names, fallback, {});
};

geodash.api.normalize_feature = function(feature)
{
  var feature = {
    'attributes': feature.attributes || feature.properties,
    'geometry': feature.geometry
  };
  return feature;
};

geodash.api.flatten = function(obj, prefix)
{
  var newObject = {};
  $.each(obj, function(key, value){
    var newKey = prefix != undefined ? prefix+"__"+key : key;
    if(
      (value === undefined) ||
      (value === null) ||
      angular.isString(value) ||
      angular.isNumber(value) ||
      angular.isArray(value) ||
      (typeof value == "boolean")
    )
    {
      newObject[newKey] = value;
    }
    else
    {
      $.each(geodash.api.flatten(value, newKey), function(key2, value2){
        newObject[key2] = value2;
      });
    }
  });
  return newObject;
};

geodash.api.unpack = function(obj)
{
  var newObject = {};
  $.each(obj, function(key, value){
    if(key.indexOf("__") == -1)
    {
      newObject[key] = value;
    }
    else
    {
      var keyChain = key.split("__");
      var target = obj;
      for(var j = 0; j < keyChain.length; j++)
      {
        var newKey = keyChain[j];
        if(!(newKey in target))
        {
          target[newKey] = {};
        }
        target = target[newKey];
      }
      target[keyChain[keyChain.length-1]] = value;
    }
  });
  return newObject;
};


geodash.listeners.toggleModal = function(event, args)
{
    console.log('event', event);
    console.log('args', args);
    //
    var main_scope = angular.element("#geodash-main").scope();
    var id = args["id"];
    var modalOptions = args['modal'] || {};
    modalOptions['show'] = false;
    var modal_scope = angular.element("#"+id).scope();
    var modal_scope_new = {
      "state": main_scope.state,
      "meta": geodash.meta
    };
    if("static" in args)
    {
      modal_scope_new = $.extend(modal_scope_new, args["static"]);
    }
    if("dynamic" in args)
    {
      $.each(args["dynamic"],function(key, value){
        if(angular.isString(value))
        {
          if(value == "map_config")
          {
            modal_scope_new[key] = main_scope.map_config;
          }
          else if(value == "state")
          {
            modal_scope_new[key] = main_scope.state;
          }
        }
        else if(angular.isArray(value))
        {
          if(value[0] == "source")
          {
            modal_scope_new[key] = extract(value.slice(1), event.targetScope);
          }
          else
          {
            if(value[0] == "map_config")
            {
              modal_scope_new[key] = extract(value.slice(1), main_scope.map_config);
            }
            else if(value[0] == "state")
            {
              modal_scope_new[key] = extract(value.slice(1), main_scope.state);
            }
          }
        }
        else
        {
          modal_scope_new[key] = value;
        }
      });
    }
    modal_scope.$apply(function () {
        // Update Scope
        modal_scope = $.extend(modal_scope, modal_scope_new);
        setTimeout(function(){
          // Update Modal Tab Selection
          // See https://github.com/angular-ui/bootstrap/issues/1741
          var modalElement = $("#"+id);
          var targetTab = modal_scope.tab;
          if(targetTab != undefined)
          {
            modalElement.find('.nav-tabs li').each(function(){
              var that = $(this);
              var thisTab = that.find('a').attr('href').substring(1);
              if(targetTab == thisTab)
              {
                  that.addClass('active');
              }
              else
              {
                  that.removeClass('active');
              }
            });
            modalElement.find('.tab-pane').each(function(){
              var that = $(this);
              if(targetTab == that.attr('id'))
              {
                  that.addClass('in active');
              }
              else
              {
                  that.removeClass('in active');
              }
            });
          }
          else
          {
            modalElement.find('.nav-tabs li').slice(0, 1).addClass('active');
            modalElement.find('.nav-tabs li').slice(1).removeClass('active');
            modalElement.find('.tab-pane').slice(0, 1).addClass('in active');
            modalElement.find('.tab-pane').slice(1).removeClass('in active');
          }
          // Toggle Modal
          $("#"+id).modal(modalOptions);
          $("#"+id).modal('toggle');
        },0);
    });
};
