
## Note for AMD-compatible version

**Notice that this is NOT the offical AMD-compatible version, and I won't keep updating it with latest commit (just stable release), so just use `dist/js/materialize.js`.**

This modified version is tested and passed on [curl.js](https://github.com/cujojs/curl), I'm not sure that it would compatible with other AMD module.

After required it at the first time, please do `Waves.displayEffect()` to show waves, like this:

```
require(['jquery']).next(['materialize'], function(Materialize){
    // add it when you required Materialize at the first time
    Waves.displayEffect();

    // do more things with Materialize here
});
```

For modified parts, see original issue here: https://github.com/Dogfalo/materialize/issues/634#issuecomment-183846293
