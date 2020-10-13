# oak-injector
dependency injector support for deno oak framework.

## usage
```ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import { GeneratorFromClasses, Restful, List, Query, Default, Controller } from "https://deno.land/x/oak_injector/mod.ts";

const app = new Application();
// ...

@Restful("/test")
class TestController extends Controller {
  @List()
  List(@Query("page") @Default("10") page: number) {
    // ...
    return page;
    // ...
  }
}
// ...
app.use(GeneratorFromClasses([TestController]).routes());
await app.listen({ port: 80 });

```

> then access `http://127.0.0.1/test?page=20`

## file upload
```ts
import {
  Controller,
  Create,
  File,
  Form,
  Restful,
} from "https://raw.githubusercontent.com/narrowizard/oak-injector/master/mod.ts";
import { FormDataFile } from "https://deno.land/x/oak@v6.3.1/multipart.ts";
import logger from "../../../middlewares/logger.ts";
import { format } from "https://deno.land/std@0.74.0/datetime/mod.ts";
import { exists } from "https://deno.land/std@0.74.0/fs/exists.ts";

@Restful("/files")
class Files extends Controller {
  @Create()
  async Post(@File("file") file: FormDataFile, @Form("type") type: string) {
    const now = new Date();
    const pathname = `upload/${type}/${format(
      now,
      "yyyyMMdd"
    )}`;
    const filename = `${pathname}/${format(now, "hhmmss")}${Math.round(Math.random() * 1000)}-${file.originalName}`;
    if (file.content) {
      // file content kept in memory
      await Deno.writeFile(filename, file.content);
    } else if (file.filename) {
      // file content written to file
      const exist = await exists(pathname);
      if (!exist) {
        await Deno.mkdir(pathname, { recursive: true });
      }
      await Deno.copyFile(file.filename, filename);
    } else {
      return "";
    }
    return filename;
  }
}

export default Files;
```

## Contribution
This repo is working in progress now, APIs will be incompatible in the future.  
Feel free to submit an issue if you have any problems or suggestions when using oak-injector.