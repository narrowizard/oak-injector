import { Application, Context, RouterContext, ServerRequest } from "../deps.ts";
import { IMap } from "./base.ts";
import { RouteModel } from "./route.ts";

enum ControllerType {
  Restful,
}

function NewEmptyContext() {
  const sr = new ServerRequest();
  sr.headers = new Headers();
  return new Context(new Application(), sr);
}

/**
 * Controller is the base Controller for class based router
 * it saves path, type and route infos.
 */
class Controller {
  static __routers__: IMap<RouteModel>;
  __path__: string = "";
  __type__: ControllerType = ControllerType.Restful;
  ctx: Context<Record<string, any>> = NewEmptyContext();

  static getRoute(name: string) {
    if (!this.__routers__) {
      this.__routers__ = {};
    }
    return this.__routers__[name] || new RouteModel();
  }

  static setRoute(name: string, route: RouteModel) {
    this.__routers__[name] = route;
  }

  setContext(
    ctx: RouterContext<
      Record<string | number, string | undefined>,
      Record<string, any>
    >
  ) {
    this.ctx = ctx;
  }
}

/**
 * define a restful pathname,
 * generated pathname is effected by method.
 * Get,Update(HttpPut),Delete => ${path}/:id
 * List(HttpGet),Create(HttpPost) => ${path}
 * @param path the resource url
 */
function Restful(path: string) {
  return <T extends { new (...args: any[]): Controller }>(constructor: T) => {
    return class extends constructor {
      __path__ = path;
      __type__ = ControllerType.Restful;
    };
  };
}

export { ControllerType, Controller, Restful };
