# oak-injector
dependency injector support for deno oak framework.

## usage
```ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import { GeneratorFromClass, Pathname, List, Query, Default, Controller } from "https://deno.land/x/oak_injector/mod.ts";

const app = new Application();
// ...

@Pathname("/test")
class TestController extends Controller {
  @List()
  List(@Query("page") @Default("10") page: number) {
    // ...
    this.ctx.response.body = page;
    // ...
  }
}
// ...
app.use(GeneratorFromClass(TestController).routes());
await app.listen({ port: 80 });

```

> then access `http://127.0.0.1/test?page=20`