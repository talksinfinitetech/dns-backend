import { ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route-53'
import * as csv from 'fast-csv'
import { Readable } from 'stream'
import client from '../utils/aws-config'

export const bulkDNSUpdate = async ({args}: any) => {
    const data: any = await getJSONFromCsv(args.file)
    let response1 = []
   for (let dataRow of data.json) {
    if (dataRow.domainName && dataRow.Type && dataRow.Value && dataRow.HostedZoneId)  {
        const params = {
            ChangeBatch: {
              Changes: [
                {
                  Action: "CREATE",
                  ResourceRecordSet: {
                    Name: dataRow.domainName,
                    Type: dataRow.Type,
                    TTL: 300,
                    ResourceRecords: [{ Value: dataRow.Value }],
                  },
                },
              ],
            },
            HostedZoneId: dataRow.HostedZoneId,
          };
          // @ts-ignore
          const data = new ChangeResourceRecordSetsCommand(params);
          const response = await client.send(data);
       console.log("Hosted zone created:", dataRow.domainName);
       response1.push({
            domainName: dataRow.domainName,
            description: dataRow.description,
            status: "Success"
       })
     } else {
         response1.push({
                domainName: dataRow.domainName,
                description: dataRow.description,
                status: "Failed"
         })
      
     }
   }
    return response1
}

export const getJSONFromCsv = async (file:any) => {
    return new Promise(async (resolve, reject) => {
      const { data, name: filename } = await file
      if (!filename) reject({ status: 401, message: 'No files were uploaded.' })
      else if (!filename.match(/\.(csv)$/)) {
        reject({ status: 401, message: 'Only csv files are allowed!' })
      }
      const stream = Readable.from(data)
      const json: any = []
  
      stream
        .pipe(csv.parse({ headers: true }))
        .on('data', (rowData:any) => {
          json.push(rowData)
        })
        .on('end', () => {
          resolve({ filename, json })
        })
        .on('error', (err: any) => {
          if (err?.message) reject({ status: 500, message: err.message })
          else reject({ status: 500, message: err })
        })
    })
  }
  