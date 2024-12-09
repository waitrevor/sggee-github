import {UnprocessableEntityException} from "@nestjs/common";

export class AcceptUpdateService {

  async checkUpdate() {
    try {
        //Check to make sure the input is valid
    } catch (e) {
        throw new UnprocessableEntityException();
    }
}

  async invokeLambdaProcessor(fileContents: string) {}
}
