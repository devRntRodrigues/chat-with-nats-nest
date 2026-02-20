/* eslint-disable @typescript-eslint/ban-types */
export const copyMetadataFromFunctionToFunction = (
  originalFunction: Function,
  newFunction: Function,
): void => {
  // Get the current metadata and set onto the wrapper
  // to ensure other decorators ( ie: NestJS EventPattern / RolesGuard )
  // won't be affected by the use of this instrumentation
  Reflect.getMetadataKeys(originalFunction).forEach((metadataKey) => {
    Reflect.defineMetadata(
      metadataKey,
      Reflect.getMetadata(metadataKey, originalFunction),
      newFunction,
    );
  });
};

export const toSnakeCase = (str: string) => {
  return str
    .match(
      /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
    )!
    .map((x: string) => x.toLowerCase())
    .join('_');
};
