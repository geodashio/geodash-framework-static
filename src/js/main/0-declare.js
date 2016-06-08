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
      var html5data = that.data();
      var intentData = html5data['intent-data'];
      if(that.hasClass('geodash-off'))
      {
        that.removeClass('geodash-off');
        geodash.api.intend(that.data('intent-names')[0], intentData, scope);
      }
      else
      {
        that.addClass('geodash-off');
        geodash.api.intend(that.data('intent-names')[1], intentData, scope);
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
      geodash.api.intend(that.data('intent-name'), that.data('intentData'), scope);
    }
  });
};

geodash.init.typeahead = function($element)
{
  $('.typeahead', $element).each(function(){
    var s = $(this);
    var placeholder = s.data('placeholder');
    var initialData = s.data('initialData');
    var w = s.data('width');
    var h = s.data('height');
    var css = 'geodashserver-welcome-select-dropdown';
    var template_empty = s.data('template-empty');
    var template_suggestion = s.data('template-suggestion');


    var bloodhoundData = [];
    if(initialData == "layers")
    {
      bloodhoundData = [];
      var featurelayers = angular.element("#geodash-main").scope()["map_config"]["featurelayers"];
      if(featurelayers != undefined)
      {
        bloodhoundData = bloodhoundData.concat($.map(featurelayers, function(fl, id){
          return {'id': id, 'text': id};
        }));
      }
      var baselayers = angular.element("#geodash-main").scope()["map_config"]["baselayers"];
      if(baselayers != undefined)
      {
        bloodhoundData = bloodhoundData.concat($.map(baselayers, function(x, i){
          return {'id': x.id, 'text': x.id};
        }));
      }
    }
    else if(initialData == "featurelayers")
    {
      bloodhoundData = [];
      var featurelayers = angular.element("#geodash-main").scope()["map_config"]["featurelayers"];
      bloodhoundData = $.map(featurelayers, function(fl, id){ return {'id': id, 'text': id}; });
    }
    else
    {
      bloodhoundData = geodash.initial_data["data"][initialData];
    }

    bloodhoundData.sort(function(a, b){
      var textA = a.text.toLowerCase();
      var textB = b.text.toLowerCase();
      if(textA < textB){ return -1; }
      else if(textA > textB){ return 1; }
      else { return 0; }
    });

    // Twitter Typeahead with
    //https://github.com/bassjobsen/typeahead.js-bootstrap-css
    var engine = new Bloodhound({
      identify: function(obj) {
        return obj['text'];
      },
      datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d.text);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: bloodhoundData
    });

    s.typeahead('destroy','NoCached');
    s.typeahead(null, {
      name: s.attr('name'),
      minLength: 1,
      limit: 10,
      hint: false,
      highlight: true,
      displayKey: 'text',
      source: engine,
      templates: {
        empty: template_empty,
        suggestion: function (data) {
            return '<p><strong>' + data.text + '</strong> - ' + data.id + '</p>';
        },
        footer: function (data) {
          return '<div>Searched for <strong>' + data.query + '</strong></div>';
        }
      }
    }).on('blur', function(event) {
      var results = engine.get($(this).val());
      var backend = $('#'+$(this).data('backend'))
        .val(results.length == 1 ? results[0]['id'] : null)
        .trigger('input')
        .change();
    })
    .on('typeahead:change', function(event, value) {
      console.log("Event: ", event, value);
      var results = engine.get(value);
      var backend = $('#'+$(this).data('backend'))
        .val(results.length == 1 ? results[0]['id'] : null)
        .trigger('input')
        .change();
    })
    .on('typeahead:select typeahead:autocomplete typeahead:cursorchange', function(event, obj) {
      console.log("Event: ", event, obj);
      var backend = $('#'+$(this).data('backend'))
        .val("id" in obj ? obj["id"] : null)
        .trigger('input')
        .change();
    });
  });

}
geodash.api.getOption = function(options, name)
{
  if(options != undefined && options != null)
  {
    return options[name];
  }
  else
  {
    return undefined;
  }
};
geodash.api.getScope = function(id)
{
  return angular.element("#"+id).scope();
};
geodash.api.getDashboardConfig = function(options)
{
  var scope = geodash.api.getOption(options, 'scope') || geodash.api.getScope("geodash-main");
  return scope.map_config;
}
geodash.api.getLayer = function(id, layers)
{
  var layer = undefined;
  var matches = $.grep(layers, function(x, i){ return x.id = id; });
  if(matches.length == 1)
  {
    layer = matches[0];
  }
  return layer;
}
geodash.api.getBaseLayer = function(id, options)
{
  var config = geodash.api.getDashboardConfig(options);
  return geodash.api.getLayer(id, config.baselayers);
}
geodash.api.getFeatureLayer = function(id, options)
{
  var config = geodash.api.getDashboardConfig(options);
  return geodash.api.getLayer(id, scope.map_config.featurelayers);
}

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
          var value_0_lc = value[0].toLowerCase();
          if(value_0_lc == "source")
          {
            modal_scope_new[key] = extract(value.slice(1), event.targetScope);
          }
          else if(value_0_lc == "baselayer" || value_0_lc == "bl")
          {
              modal_scope_new[key] = geodash.api.getBaseLayer(value[1]) || undefined;
          }
          else if(value_0_lc == "featurelayer" || value_0_lc == "fl")
          {
              modal_scope_new[key] = geodash.api.getFeatureLayer(value[1]) || undefined;
          }
          else
          {
            if(value_0_lc == "map_config")
            {
              modal_scope_new[key] = extract(value.slice(1), main_scope.map_config);
            }
            else if(value_0_lc == "state")
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
          // Initalize Tooltips
          $('[data-toggle="tooltip"]', modalElement).tooltip();
          //Initialize Typeahead
          geodash.init.typeahead(modalElement);
          // Toggle Modal
          $("#"+id).modal(modalOptions);
          $("#"+id).modal('toggle');
        },0);
    });
};
