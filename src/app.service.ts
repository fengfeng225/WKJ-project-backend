import { Injectable } from '@nestjs/common';
import util from 'src/utils/util';

@Injectable()
export class AppService {
  getIds(count: number) {
    const ids = []
    for (let i = 0; i < count; i++) {
      ids.push(util.generateUniqueId())
    }
    const noRepeatIds = [...new Set(ids)]
    if (noRepeatIds.length === ids.length) return ids
    return 'has repeat id'
  }
}