import * as si from 'systeminformation';

async function authorize() {
  const uuidInfo = await si.uuid()
  const diskInfo = await si.diskLayout()
  const serialKey = diskInfo[0].serialNum.split('_').map(v => v[0]).join('')
  if (uuidInfo.macs[0] === 'f8:8c:21:c2:8c:fc' || serialKey === 'A297') return true
}

export default authorize()