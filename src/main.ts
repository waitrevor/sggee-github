import {NestFactory} from "@nestjs/core";
import {AppModule} from "./AppModule.js";
import cookieParser from "cookie-parser";
import {Callback, Context, Handler} from 'aws-lambda';
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface.js";
import {configure} from '@codegenie/serverless-express';

let server: Handler;

async function bootstrap() {
    /*
    const app = await NestFactory.createApplicationContext(AppModule);
    await app.get(UpdateService).doUpdates();
    console.log("DONE!");
    app.close();
     */

    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    const corsOptions: CorsOptions = {
        origin: true,
        methods: 'GET,HEAD,POST',
        credentials: true,
    };
    app.enableCors(corsOptions);
    await app.listen(process.env.LISTEN_PORT ?? 80);
    console.log(`Application is running on: ${await app.getUrl()}`);
}



async function lambdaBootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return configure({ app: expressApp })
}

export const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback,
) => {
    server = server ?? (await lambdaBootstrap());
    return server(event, context, callback);
};

// if (!process.env.IS_LAMBDA) {
//     await bootstrap();
// }
bootstrap()