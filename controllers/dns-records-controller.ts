import { ChangeResourceRecordSetsCommand, DeleteHostedZoneCommand, ListHostedZonesCommand, ListResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import client from "../utils/aws-config"
import { bulkDNSUpdate } from "../services/dns-service";
import { createObjectCsvWriter } from "csv-writer";
import fs from 'fs';

export const listDnsRecords = async (req: any, res: any) => {
  try {
    const { zone_id } = req.params;
    const command = new ListHostedZonesCommand();
    const response = await client.send(command);

    const { HostedZones } = response;

    const data = {
      HostedZoneId: zone_id,
    };

    const prarms = new ListResourceRecordSetsCommand(data);
    const result = await client.send(prarms);
    const records = result.ResourceRecordSets;

    return res.status(200).json(records);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
};

export const createDnsRecords = async (req: any, res: any) => {
  try {
    const { dns_data, code } = req.body;
    const { domain_name, record_type, record_value } = dns_data;
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: "CREATE",
            ResourceRecordSet: {
              Name: domain_name,
              Type: record_type,
              TTL: 300,
              ResourceRecords: [{ Value: record_value }],
            },
          },
        ],
      },
      HostedZoneId: code,
    };
    // @ts-ignore
    const data = new ChangeResourceRecordSetsCommand(params);
    const response = await client.send(data);
    return res
      .status(200)
      .json({ message: "DNS record created successfully" }, response);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create DNS record", error: error });
  }
};

export const updateDnsRecords = async (req: any, res: any) => {
  try {
    const { dns_record_data, code } = req.body;
    if (dns_record_data.recordType !== "SOA") {
      const params = {
        HostedZoneId: code,
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: dns_record_data.Name,
                Type: dns_record_data.Type,
                TTL: dns_record_data.ttl,
                ResourceRecords: [
                  {
                    Value: dns_record_data.Value,
                  },
                ],
              },
            },
          ],
        },
      };
      // @ts-ignore
      const command = new ChangeResourceRecordSetsCommand(params)
      const response = await client.send(command);
      return res
        .status(200)
        .json({ message: "Dns record created successfully" }, response);
    } else {
      return res.status(400).json({ message: "Cannot update Dns record" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create Dns record", error: error });
  }
};

export const deleteDnsRecords = async (req: any, res: any) => {
  try {
    const { zone_id } = req.params;
    const { Name, Type, ResourceRecords, TTL } = req.body.data;
    const { code } = req.query;
    if (Type !== "SOA") {
      const params = {
        HostedZoneId: code,
        ChangeBatch: {
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: req.body.data,
            },
          ],
        },
      };
      // @ts-ignore
      const command = new ChangeResourceRecordSetsCommand(params)
      const response = await client.send(command);
      return res.json({ message: "Dns record deleted successfully" });
    } else {
      return res.status(400).json({ message: "Cannot delete the Dns record!" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server error", error: error });
  }
};


export const bulkDnsUpload = async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const file = req.file;
  const args = { file };
  const importData = await bulkDNSUpdate({ args })
  const csvWriter = createObjectCsvWriter({
    path: 'importData.csv',
    header: [{ id: 'column1', title: 'Column 1' }, { id: 'column2', title: 'Column 2' }], // Modify headers according to your importData structure
  });
  await csvWriter.writeRecords(importData);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=importData.csv');
  const fileStream = fs.createReadStream('importData.csv');
  fileStream.pipe(res);
  return res.download(fileStream)
}