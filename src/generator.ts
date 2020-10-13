import { FormDataBody } from "https://deno.land/x/oak@v6.2.0/multipart.ts";
import { Status } from "https://deno.land/std@0.73.0/http/http_status.ts";
import { Router, RouterContext } from "../deps.ts";
import { IMap, ValueType } from "./base.ts";
import { Controller, ControllerType } from "./controller.ts";
import { Methods, RouteModel, ParamModel, Source } from "./route.ts";

function GeneratorFromClasses<
  T extends { new (...args: any[]): Controller } & {
    __routers__: IMap<RouteModel>;
  }
>(classes: T[]): Router {
  const router = new Router();
  for (const c of classes) {
    const instance = new c();
    if (instance.__type__ === ControllerType.Restful) {
      // restful controller now
      for (const key in c.__routers__) {
        const item = c.__routers__[key];
        switch (item.method) {
          case Methods.Get:
            router.get(
              `${instance.__path__}/:id`,
              reqHandlerFactory(instance, item)
            );
            break;
          case Methods.List:
            router.get(instance.__path__, reqHandlerFactory(instance, item));
            break;
          case Methods.Create:
            router.post(instance.__path__, reqHandlerFactory(instance, item));
            break;
          case Methods.Update:
            router.put(
              `${instance.__path__}/:id`,
              reqHandlerFactory(instance, item)
            );
            break;
          case Methods.Delete:
            router.delete(
              `${instance.__path__}/:id`,
              reqHandlerFactory(instance, item)
            );
            break;
        }
      }
    }
  }
  return router;
}

function reqHandlerFactory(instance: Controller, item: RouteModel) {
  return async (
    ctx: RouterContext<
      Record<string | number, string | undefined>,
      Record<string, any>
    >
  ) => {
    instance.setContext(ctx);
    const params = await paramsGenerator(ctx, item.params);
    if (params.Succ) {
      const data = await item.value.call(instance, ...(params.Params || []));
      ctx.response.body = data;
    } else {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = params.Errors;
    }
  };
}

async function paramsGenerator(
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
  params: ParamModel[]
) {
  // if body is read
  let readed = false;
  const res = [];
  const body = ctx.request.body();
  let formData: FormDataBody = { fields: {} };
  for (let p of params) {
    if (!p.name) {
      continue;
    }
    let value: ValueType = null;
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
        if (body.type === "form") {
          value = (await body.value).get(p.name);
        } else if (body.type === "form-data") {
          if (!readed) {
            formData = await body.value.read();
            readed = true;
          }
          value = formData.fields[p.name];
        }
        break;
      case Source.Auto:
        if (!value) {
          value = {};
        }
        // body
        if (body.type === "json") {
          const json: IMap<string> = await body.value;
          value = json;
        } else if (body.type === "form") {
          const form = (await body.value).entries();
          for (const [k, v] of form) {
            value[k] = v;
          }
        } else if (body.type === "form-data") {
          if (!readed) {
            formData = await body.value.read();
            readed = true;
          }
          for (const k in formData.fields) {
            if (formData.fields[k]) {
              value[k] = formData.fields[k];
            }
          }
          if (formData.files) {
            for (let i = 0; i < formData.files?.length; i++) {
              value[formData.files[i].name] = formData.files[i];
            }
          }
        }
        // query
        const query = ctx.request.url.searchParams.entries();
        for (const [k, v] of query) {
          value[k] = v;
        }
        // path
        for (const k in ctx.params) {
          const temp = ctx.params[k];
          if (temp) {
            value[k] = temp;
          }
        }
        break;
      case Source.Json:
        if (body.type === "json") {
          value = await body.value;
        }
        break;
      case Source.File:
        if (body.type === "form-data") {
          if (!readed) {
            formData = await body.value.read();
            readed = true;
          }
          if (formData.files) {
            for (let i = 0; i < formData.files?.length; i++) {
              if (formData.files[i].name === p.name) {
                value = formData.files[i];
              }
            }
          }
        }
        break;
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
        return { Succ: false, Errors: `${p.name} validate failed` };
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
  return { Succ: true, Params: res };
}

export { GeneratorFromClasses };
