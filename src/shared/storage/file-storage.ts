export type BucketName = "attachments" | "avatars";

export interface FileStorage {
    put(bucket: BucketName, key: string, body: Buffer, contentType: string): Promise<void>;
    remove(bucket: BucketName, key: string): Promise<void>;
    publicUrl(bucket: BucketName, key: string): string;
    signedUrl(bucket: BucketName, key: string, expiresInSeconds: number, downloadName?: string): Promise<string>;
}