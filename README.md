# oak-injector
dependency injector support for deno oak framework.

## usage
```ts
@Pathname("/test")
class TestController extends Controller {
  @List()
  List(@Query("page") @Default("10") page: number) {
    // ...
    this.ctx.response.body = page;
    // ...
  }
}
```