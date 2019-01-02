import {Category} from "typescript-logging";
 
// Create categories, they will autoregister themselves, one category without parent (root) and a child category.
export const catService: Category = new Category("iotile.cloud");
export const catCloud: Category = new Category("IOTileCloud", catService);