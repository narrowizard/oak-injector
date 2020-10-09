import { Application, Context, RouterContext, ServerRequest } from "../deps.ts";
import { IMap } from "./base.ts";
import { RouteModel } from "./route.ts";

function NewEmptyContext() {
  const sr = new ServerRequest();
  sr.headers = new Headers();
  return new Context(new Application(), sr);
}

class Controller {
  static __routers__: IMap<RouteModel>;
  __path__: string = "";
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

export { Controller };
