import { CreateHostedZoneCommand, DeleteHostedZoneCommand, ListHostedZonesCommand } from "@aws-sdk/client-route-53";
import client from "../utils/aws-config"
import { bulkDomainUpdate } from "../services/domain-service";
import { createObjectCsvWriter } from "csv-writer";
import fs from 'fs';


export const listDomains = async (req: any, res: any) => {
  try {
    const result = new ListHostedZonesCommand();
    const response = await client.send(result);
    return res.status(200).json({ zones: response.HostedZones });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
};

export const createHostedZone = async (req: any, res: any) => {
  try {
    const { domain_name, description } = req.body;
    if (!domain_name) {
      return res.status(400).json("Domain name is required");
    }

    const params = {
      CallerReference: `${Date.now()}`,
      Name: domain_name,
      HostedZoneConfig: {
        Comment: description
      },
    };

    const result = new CreateHostedZoneCommand(params)
    const response = await client.send(result);
    console.log("Hosted zone created:", response);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error creating hosted zone:", error);
    return res.status(500).json("Error deleting hosted zone:", error);
  }
};

export const deleteHostedZone = async (req: any, res: any) => {
  try {
    const { zoneId } = req.params;
    const params = {
      Id: zoneId,
    };
    const result = new DeleteHostedZoneCommand(params);
    await client.send(result);
    console.log("Hosted zone deleted:", zoneId);
    return res.status(200).json("Successfully Deleted the Record");
  } catch (error) {
    return res.status(500).json("Error deleting hosted zone:", error);
  }
};

export const bulkDomainUpload = async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const file = req.file;
  const args = { file };
  try {
    const importData = await bulkDomainUpdate({args});

    // Assume importData is an array of objects
    const csvWriter = createObjectCsvWriter({
      path: 'importData.csv',
      header: [
        { id: 'column1', title: 'Column 1' }, 
        { id: 'column2', title: 'Column 2' } // Adjust headers according to your importData structure
      ],
    });
    await csvWriter.writeRecords(importData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=importData.csv');

    const fileStream = fs.createReadStream('importData.csv');
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
}