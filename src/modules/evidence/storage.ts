import fs from 'fs';
import path from 'path';
import { config } from '../../config';

export interface StorageDriver {
  uploadFile(file: Express.Multer.File, key: string): Promise<{ publicUrl?: string; storageKey: string }>;
  getFileStream(key: string): Promise<NodeJS.ReadableStream>;
  deleteFile(key: string): Promise<boolean>;
}

export class LocalStorageDriver implements StorageDriver {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(config.LOCAL_UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    const destination = path.join(this.uploadDir, key);
    fs.writeFileSync(destination, file.buffer);
    return {
      storageKey: key,
      publicUrl: `/api/v1/evidence/files/${key}`,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = path.join(this.uploadDir, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File with key ${key} not found on local disk`);
    }
    return fs.createReadStream(filePath);
  }

  async deleteFile(key: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

export class S3StorageDriver implements StorageDriver {
  async uploadFile(file: Express.Multer.File, key: string) {
    // Adapter placeholder configured for AWS S3 / MinIO
    return {
      storageKey: key,
      publicUrl: `https://${config.AWS_S3_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    throw new Error('S3 stream requires live AWS credentials.');
  }

  async deleteFile(_key: string): Promise<boolean> {
    return true;
  }
}

export class CloudinaryStorageDriver implements StorageDriver {
  async uploadFile(_file: Express.Multer.File, key: string) {
    return {
      storageKey: key,
      publicUrl: `https://res.cloudinary.com/${config.CLOUDINARY_CLOUD_NAME}/image/upload/${key}`,
    };
  }

  async getFileStream(_key: string): Promise<NodeJS.ReadableStream> {
    throw new Error('Cloudinary streaming requires direct URL access.');
  }

  async deleteFile(_key: string): Promise<boolean> {
    return true;
  }
}

export function getStorageDriver(): StorageDriver {
  switch (config.STORAGE_DRIVER) {
    case 's3':
      return new S3StorageDriver();
    case 'cloudinary':
      return new CloudinaryStorageDriver();
    case 'local':
    default:
      return new LocalStorageDriver();
  }
}
