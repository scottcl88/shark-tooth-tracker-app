/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Injectable } from '@angular/core';
import { Account } from './_models';
import { datadogLogs } from '@datadog/browser-logs';
import { environment } from 'src/environments/environment';

export declare const StatusType: {
  readonly debug: "debug";
  readonly error: "error";
  readonly info: "info";
  readonly warn: "warn";
};
export type StatusType = (typeof StatusType)[keyof typeof StatusType];
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  public package: any = require('../../package.json');
  constructor() {
    if (environment.production) {
      datadogLogs.init({
        clientToken: 'pubf1646a172bce83f8df89077468e1df4a',
        site: 'us5.datadoghq.com',
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        version: this.package.version,
        service: this.package.name,
        env: "prod"
      });
    } else {
      datadogLogs.init({
        clientToken: 'pubf1646a172bce83f8df89077468e1df4a',
        site: 'us5.datadoghq.com',
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        version: this.package.version,
        service: this.package.name,
        env: "dev"
      })
    }
  }

  async init() {
    this.debug("loggerService init");
  }

  enableForwardConsoleLogs() {
    datadogLogs.setGlobalContext({ forwardConsoleLogs: 'all' });
  }

  disableForwardConsoleLogs() {
    datadogLogs.setGlobalContext({ forwardConsoleLogs: [] });
  }

  setLevel(minLogLevel: number) {
    switch (minLogLevel) {
      case 0: {
        datadogLogs.logger.setLevel("debug");
        break;
      }
      case 1: {
        datadogLogs.logger.setLevel("info");
        break;
      }
      case 2: {
        datadogLogs.logger.setLevel("warn");
        break;
      }
      case 3: {
        datadogLogs.logger.setLevel("error");
        break;
      }
      default: {
        datadogLogs.logger.setLevel("error");
        break;
      }
    }
  }

  setAccount(newAccount: Account) {
    datadogLogs.setUser({ id: newAccount.userId, name: newAccount.name, email: newAccount.email });
  }

  log(message: string, messageContext?: object, status?: StatusType, error?: Error): void {
    if (!environment.production) {
      console.log(message, messageContext, error);
    }
    datadogLogs.logger.log(message, messageContext, status, error);
  }
  debug(message: string, messageContext?: object, error?: Error): void {
    if (!environment.production) {
      console.debug(message, messageContext, error);
    }
    datadogLogs.logger.debug(message, messageContext, error);
  }
  info(message: string, messageContext?: object, error?: Error): void {
    if (!environment.production) {
      console.info(message, messageContext, error);
    }
    datadogLogs.logger.info(message, messageContext, error);
  }
  warn(message: string, messageContext?: object, error?: Error): void {
    if (!environment.production) {
      console.warn(message, messageContext, error);
    }
    datadogLogs.logger.warn(message, messageContext, error);
  }
  error(message: string, error?: Error): void {
    if (!environment.production) {
      console.error(message, error);
    }
    datadogLogs.logger.error(message, undefined, error);
  }
  errorWithContext(message: string, messageContext?: object, error?: Error): void {
    if (!environment.production) {
      console.error(message, messageContext, error);
    }
    datadogLogs.logger.error(message, messageContext, error);
  }
}
