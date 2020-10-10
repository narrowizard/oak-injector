import { EmptyFunction, ValueType } from "./base.ts";
import logger from "./logger.ts";

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

// methods

function List() {
  return route(Methods.List);
}

function Get() {
  return route(Methods.Get);
}

function Create() {
  return route(Methods.Create);
}

function Update() {
  return route(Methods.Update);
}

function Delete() {
  return route(Methods.Delete);
}

function route(m: Methods) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const route: RouteModel = target.constructor.getRoute(propertyKey);
    route.method = m;
    route.value = descriptor.value;
    target.constructor.setRoute(propertyKey, route);
  };
}

/**
 * ParamModel represent a injectable param.
 * inject progress:
 * 1. get value from source
 * 2. validate value
 * 3. convert value
 * 4. invoke request handler with converted value
 */
class ParamModel {
  public source?: Source;
  public name?: string;
  public defaultVal?: string;
  public validator: ((value: ValueType) => boolean)[] = [];
  public convertor: ((value: ValueType) => ValueType)[] = [];

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

  public AddValidator(validator: (value: ValueType) => boolean) {
    this.validator.push(validator);
  }

  /**
   * add a convertor to a parameter, convertors will be invoked order by prior,
   * don't use a large prior, since convertors is simplly stored in an array.
   * @param convertor convert value to value
   * @param prior if not provide, prior will be convertors' length.
   */
  public AddConvertor(
    convertor: (value: ValueType) => ValueType,
    prior?: number
  ) {
    if (!prior) {
      prior = this.convertor.length;
    }
    if (this.convertor[prior]) {
      logger.warning(
        `convertor of prior level ${prior} is existed, it will be override now.`
      );
    }
    this.convertor[prior] = convertor;
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

export {
  ParamModel,
  Source,
  Query,
  Path,
  Form,
  Header,
  Methods,
  RouteModel,
  List,
  Get,
  Create,
  Update,
  Delete,
};
