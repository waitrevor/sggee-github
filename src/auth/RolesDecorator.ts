import {Reflector} from "@nestjs/core";
import { SetMetadata } from '@nestjs/common';

export const Roles = Reflector.createDecorator<string[]>();

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);