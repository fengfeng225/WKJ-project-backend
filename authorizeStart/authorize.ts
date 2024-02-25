import * as si from 'systeminformation';

async function authorize() {
  const uuidInfo = await si.uuid()
  const diskInfo = await si.diskLayout()
  const serialKey = diskInfo[0].serialNum.split('_').map(v => v[0]).join('')
  // console.log(uuidInfo, serialKey)
  if (uuidInfo.macs[0] === '00:e0:70:4e:91:42' || serialKey === 'Z') return true
}

export default authorize