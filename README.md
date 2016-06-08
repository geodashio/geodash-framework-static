# GeoDash Javascript (geodash.js)

DevOps tools for developing & deploying [GeoDash](http://geodash.io/), including [Ansible](https://www.ansible.com/), [Packer](https://www.packer.io/), [Vagrant](https://www.vagrantup.com/), and [Fabric](http://www.fabfile.org/) configuration files for building and managing Ubuntu and CentOS GeoDash boxes.

# Contributing

# Conventions

## HTML 5 Data (data-* Attributes)

HTML 5 data (or data-* Attributes) is a useful mechanism for sharing information between backend Angular components and front-end jquery-based components.  http://www.w3schools.com/tags/att_global_data.asp

As a convention, when the data you need to pass gets to unweidly to input directly into a template, use a function in the controller called `html5data`.  Don't use a custom name or function definition.  Just stick with `html5data` and use the special `arguments` function.  That will simplify maintainability and visibility over time.

```html
<a
  class="geodash-intent"
  data-intent-name="toggleModal"
  data-intent-data="{{ html5data('toggleModal', 'geodash-modal-layer-config', 'featurelayer', layer) }}"
  data-intent-ctrl="geodash-map-legend">
  <i class="fa fa-cog"></i>
</a>
```

```javascript
// controller_legend.js
$scope.html5data = function()
{
  var args = arguments;
  var zero_lc = args[0].toLowerCase();
  if(zero_lc == "toggleModal")
  {
    var id = args[1];
    var layer = args[2];
    return {
      "id": args[1],
      "static": {
        "layerID": layer.id,
      },
      "dynamic" : {
        "layer": ["featurelayer", layer.id]
      }
    };
  }
  else
  {
    return "";
  }
};
```
