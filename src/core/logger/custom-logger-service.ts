import { ConsoleLogger } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  private typeList = ['info', 'ScheduledTask']

  log(message: any, context?: string) {
    if (this.typeList.includes(context)) super.log(message)
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {
    super.fatal(message)
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    super.error(message)
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    super.warn(message)
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    super.debug(message)
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message)
  }
}