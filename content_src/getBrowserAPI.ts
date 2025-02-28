export function getBrowserAPI() {
    // @ts-expect-error
    return typeof browser !== 'undefined' ? browser : chrome;
}
