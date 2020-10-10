import { ParamModel, RouteModel } from "./route.ts";

function Required() {
  return (target: any, propertyKey: string, paramIndex: number) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    const pm = new ParamModel();
    pm.AddValidator((value) => !!value);
    route.AddParamDefinition(paramIndex, pm);
    target.constructor.setRoute(propertyKey, route);
  };
}

function Default(value: string) {
  return (target: any, propertyKey: string, paramIndex: number) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    const pm = new ParamModel();
    pm.defaultVal = value;
    route.AddParamDefinition(paramIndex, pm);
    target.constructor.setRoute(propertyKey, route);
  };
}

export { Required, Default };
