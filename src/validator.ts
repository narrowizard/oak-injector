import { ValueType } from "./base.ts";
import { ParamModel, RouteModel } from "./route.ts";

function Required(msg?: string) {
  return (target: any, propertyKey: string, paramIndex: number) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    const pm = new ParamModel();
    pm.AddValidator((value) => !!value || `${msg}`);
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

function CustomValidator(validator: (value: ValueType) => boolean | string) {
  return (target: any, propertyKey: string, paramIndex: number) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    const pm = new ParamModel();
    pm.AddValidator(validator);
    route.AddParamDefinition(paramIndex, pm);
    target.constructor.setRoute(propertyKey, route);
  };
}

export { Required, Default, CustomValidator };
