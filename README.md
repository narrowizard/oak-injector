# oak-injector
dependency injector support for deno oak framework.

## usage
```ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import { GeneratorFromClasses, Restful, List, Query, Default, Controller } from "https://deno.land/x/oak_injector/mod.ts";

const app = new Application();
// ...

@Restful("/test")
class TestController extends Controller {
  @List()
  List(@Query("page") @Default("10") page: number) {
    // ...
    this.ctx.response.body = page;
    // ...
  }
}
// ...
app.use(GeneratorFromClasses([TestController]).routes());
await app.listen({ port: 80 });

```

> then access `http://127.0.0.1/test?page=20`

## Contribution
This repo is working in progress now, APIs will be incompatible in the future.  
Feel free to submit an issue if you have any problems or suggestions when using oak-injector.