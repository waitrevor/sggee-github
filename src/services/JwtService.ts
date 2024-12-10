import {
  createRemoteJWKSet,
  decodeJwt,
  errors,
  jwtVerify
} from "jose";
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException
} from "@nestjs/common";
import {SessionToken} from "../interfaces/Sessions.js";

@Injectable()
export class JwtService {

  private readonly jwksEndpoint: string;
  private jwks: any;

  constructor() {
      if (!process.env.JWKS_ENDPOINT) {
          throw new ServiceUnavailableException();
      }
      this.jwksEndpoint = process.env.JWKS_ENDPOINT;
  }

  decodeToken(token: string): SessionToken {
      return decodeJwt(token);
  }

  async isValidToken(token: string) {
      if (!token) throw new UnauthorizedException("Missing token");
      try {
          if (!this.jwks) {
              console.log("Loading public key for tokens", this.jwksEndpoint);
              const url = new URL(this.jwksEndpoint);
              this.jwks = createRemoteJWKSet(url);
              console.log(this.jwks)
          }
          const {payload} = await jwtVerify<SessionToken>(token, this.jwks, {subject: "access"});
          return payload;
      } catch (error: any) {
          console.log("ERROR token:", token);
          console.log("ERROR", error);
          if (error?.code === 'ERR_JWKS_MULTIPLE_MATCHING_KEYS') {
              return await this.handleMultipleMatchingKeys(error, token);
          } else {
              throw new UnauthorizedException();
          }
      }
  }

  private async handleMultipleMatchingKeys(error: any, token: string) {
      for await (const publicKey of error) {
          try {
              return await jwtVerify<SessionToken>(token, publicKey, {subject: "access"});
          } catch (innerError: any) {
              if (innerError?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
                  continue;
              }
              throw innerError;
          }
      }
      throw new errors.JWSSignatureVerificationFailed();
  }

}