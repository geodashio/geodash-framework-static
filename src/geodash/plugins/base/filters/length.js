geodash.filters["len"] = geodash.filters["length"] = function()
{
  return function(value)
  {
    if($.isArray(value))
    {
      return value.length;
    }
    else
    {
      return 0;
    }
  };
};
