import * as crypto from 'crypto';

const bl = {
  generateUniqueId(): string {
    const timestamp = Date.now().toString();
    const numericId = this.generateNumericId(7)
    return timestamp + numericId
  },

  generateNumericId(length = 18): string {
    const bytes = crypto.randomBytes(length);
    const randomDigits = Array.from(bytes, byte => (+byte % 10).toString()).join('');
    return randomDigits;
  }
}

export default bl