import { EmptyFunction } from "./base.ts";

enum Methods {
  List,
  Get,
  Create,
  Update,
  Delete,
}

enum Source {
  Path,
  Query,
  Header,
  Form,
  File,
  Body,
  Auto,
}

class RouteModel {
  public method: Methods = Methods.Get;
  public value: Function = EmptyFunction;
  public params: ParamModel[] = [];

  AddParamDefinition(index: number, param: ParamModel) {
    (this.params[index] ??= new ParamModel()).CombineParamModel(param);
  }
}

class ParamModel {
  public source: Source = Source.Query;
  public name: string = "";
  public defaultVal: string = "";
  public validator: ((value: string | undefined | null) => boolean)[] = [];

  /**
   * CombineParamModel combine two param model,
   * if property is setting both in m and this,
   * it take m's properties.
   * @param m the param model to be combined.
   */
  public CombineParamModel(m: ParamModel) {
    if (m.source !== undefined) {
      this.source = m.source;
    }
    if (m.name !== undefined) {
      this.name = m.name;
    }
    if (m.defaultVal !== undefined) {
      this.defaultVal = m.defaultVal;
    }
  }

  public AddValidator(
    validator: (value: string | undefined | null) => boolean
  ) {
    this.validator.push(validator);
  }
}

function Query(key: string) {
  return params(Source.Query, key);
}

function Path(key: string) {
  return params(Source.Path, key);
}

function Form(key: string) {
  return params(Source.Form, key);
}

function Header(key: string) {
  return params(Source.Header, key);
}

function Auto(key: string) {}

function params(source: Source, key: string) {
  return (target: any, propertyKey: string, paramIndex: number) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    const pm = new ParamModel();
    pm.source = source;
    pm.name = key;
    route.AddParamDefinition(paramIndex, pm);
    target.constructor.setRoute(propertyKey, route);
  };
}

function Required() {
  return (target: any, propertyKey: string, paramIndex: number) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    const pm = new ParamModel();
    pm.AddValidator((value) => !!value);
    route.AddParamDefinition(paramIndex, pm);
    target.constructor.setRoute(propertyKey, route);
  };
}

export {
  ParamModel,
  Source,
  Query,
  Path,
  Form,
  Header,
  Methods,
  RouteModel,
  Required,
};
