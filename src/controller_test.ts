import { assertEquals } from "../deps.ts";
import { Controller, Restful } from "./controller.ts";
import { GeneratorFromClasses } from "./generator.ts";
import {
  List,
  Methods,
  ParamModel,
  Query,
  RouteModel,
  Source,
} from "./route.ts";
import { Default } from "./validator.ts";

const pathname = "/test";

@Restful(pathname)
class TestController extends Controller {
  @List()
  List(@Query("page") @Default("10") page: number) {}
}

GeneratorFromClasses([TestController]);

Deno.test("pathname", () => {
  const tc = new TestController();
  assertEquals(tc.__path__, pathname);
});

Deno.test("routers", () => {
  const listRoute = new RouteModel();
  listRoute.method = Methods.List;
  listRoute.value = new TestController().List;
  const pageParam = new ParamModel();
  pageParam.name = "page";
  pageParam.defaultVal = "10";
  pageParam.source = Source.Query;
  listRoute.params = [pageParam];
  assertEquals(listRoute, TestController.__routers__["List"]);
});
