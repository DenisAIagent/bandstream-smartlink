import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// S3-compatible storage client (works with Cloudflare R2, MinIO, AWS S3, Scaleway, etc.)
let s3Client: S3Client | null = null;

function getClient() {
    if (!s3Client) {
        s3Client = new S3Client({
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || 'auto',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
            forcePathStyle: true,
        });
    }
    return s3Client;
}

const getBucketName = () => process.env.S3_BUCKET_NAME || '';
const getPublicUrl = () => process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || '';

// Upload a file to S3-compatible storage
export async function uploadFile(key: string, body: Buffer | string, contentType: string) {
    try {
        const upload = new Upload({
            client: getClient(),
            params: {
                Bucket: getBucketName(),
                Key: key,
                Body: body,
                ContentType: contentType,
            },
        });

        const data = await upload.done();
        // Construct public URL since R2 doesn't return Location
        const publicUrl = `${getPublicUrl()}/${key}`;
        return publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Delete a file from S3-compatible storage
export async function deleteFile(key: string) {
    try {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        await getClient().send(deleteCommand);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}
