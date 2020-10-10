import { Router, RouterContext } from "../deps.ts";
import { IMap } from "./base.ts";
import { Controller } from "./controller.ts";
import { Methods, RouteModel, ParamModel, Source } from "./route.ts";

function GeneratorFromClass<
  T extends { new (...args: any[]): Controller } & {
    __routers__: IMap<RouteModel>;
  }
>(c: T): Router {
  const router = new Router();
  const instance = new c();
  for (const key in c.__routers__) {
    const item = c.__routers__[key];
    switch (item.method) {
      case Methods.Get:
        router.get(`${instance.__path__}/:id`, async (ctx) => {
          instance.setContext(ctx);
          const params = await paramsGenerator(ctx, item.params);
          await item.value.call(instance, ...params);
        });
        break;
      case Methods.List:
        router.get(instance.__path__, async (ctx) => {
          instance.setContext(ctx);
          const params = await paramsGenerator(ctx, item.params);
          await item.value.call(instance, ...params);
        });
        break;
      case Methods.Create:
        router.post(instance.__path__, async (ctx) => {
          instance.setContext(ctx);
          const params = await paramsGenerator(ctx, item.params);
          await item.value.call(instance, ...params);
        });
        break;
      case Methods.Update:
        router.put(instance.__path__, async (ctx) => {
          instance.setContext(ctx);
          const params = await paramsGenerator(ctx, item.params);
          await item.value.call(instance, ...params);
        });
        break;
      case Methods.Delete:
        router.delete(instance.__path__, async (ctx) => {
          instance.setContext(ctx);
          const params = await paramsGenerator(ctx, item.params);
          await item.value.call(instance, ...params);
        });
        break;
    }
  }
  return router;
}

async function paramsGenerator(
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
  params: ParamModel[]
) {
  const res = [];
  for (let p of params) {
    if (!p.name) {
      continue;
    }
    let value: string | null | undefined = null;
    switch (p.source) {
      case Source.Query:
        value = ctx.request.url.searchParams.get(p.name);
        break;
      case Source.Header:
        value = ctx.request.headers.get(p.name);
        break;
      case Source.Path:
        value = ctx.params[p.name];
        break;
      case Source.Form:
        const b = ctx.request.body({ type: "form" });
        value = (await b.value).get(p.name);
        break;
      // TODO: body, file
    }
    // default
    if (value === null && p.defaultVal !== undefined) {
      value = p.defaultVal;
    }
    // validate
    if (p.validator) {
      let succ = true;
      p.validator.forEach((v) => {
        if (!v(value)) {
          succ = false;
        }
      });
      if (!succ) {
        // TODO: validate failed
      }
    }
    // convertor
    if (p.convertor.length > 0) {
      for (let i = 0; i < p.convertor.length; i++) {
        if (p.convertor[i]) {
          value = p.convertor[i](value);
        }
      }
    }
    res.push(value);
  }
  return res;
}

export { GeneratorFromClass };
