export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  export function formatList<T extends string | number>(
    arr: T[],
    locale: string = "pt-BR",
    type: Intl.ListFormatType = "conjunction",
    style: Intl.ListFormatStyle = "long",
  ) {
    return new Intl.ListFormat(locale, { type, style }).format(arr.map(String));
  }
  
  export function isEmpty(value: any): boolean {
    return value === null || value === undefined || value === "";
  }
  