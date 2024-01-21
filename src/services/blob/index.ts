import {
  VERCEL_BLOB_BASE_URL,
  vercelBlobCopy,
  vercelBlobDelete,
  vercelBlobList,
  vercelBlobUploadFromClient,
} from './vercel-blob';
import {
  AWS_S3_BASE_URL,
  awsS3Copy,
  awsS3Move,
  awsS3Delete,
  awsS3List,
  awsS3UploadFromClient,
  isUrlFromAwsS3,
  NEXT_PUBLIC_UPYUN_PHOTO_PATH,
  NEXT_PUBLIC_UPYUN_UPLOAD_PATH
} from './aws-s3';
import { HAS_AWS_S3_STORAGE, HAS_AWS_S3_STORAGE_CLIENT } from '@/site/config';
import { HAS_UPYUN_STORAGE } from '@/site/config';

const PREFIX_UPLOAD = 'upload';
const PREFIX_PHOTO = 'photo';
const BLOB_BASE_URL = HAS_AWS_S3_STORAGE_CLIENT
  ? AWS_S3_BASE_URL
  : VERCEL_BLOB_BASE_URL;

const REGEX_UPLOAD_PATH = new RegExp(
  `(?:${PREFIX_UPLOAD})\.[a-z]{1,4}`,
  'i',
);

const REGEX_UPLOAD_ID = new RegExp(
  `.${PREFIX_UPLOAD}-([a-z0-9]+)\.[a-z]{1,4}$`,
  'i',
);

export const fileNameForBlobUrl = (url: string) =>
  url.replace(`${BLOB_BASE_URL}/`, '');

export const getExtensionFromBlobUrl = (url: string) =>
  url.match(/.([a-z]{1,4})$/i)?.[1];

export const getIdFromBlobUrl = (url: string) =>
  url.match(REGEX_UPLOAD_ID)?.[1];

export const isUploadPathnameValid = (pathname?: string) =>
  pathname?.match(REGEX_UPLOAD_PATH);

const getFileNameFromBlobUrl = (url: string) =>
  (new URL(url).pathname.match(/\/(.+)$/)?.[1]) ?? '';

export const uploadPhotoFromClient = async (
  // fileName: string,
  file: File | Blob,
  extension = 'jpg',
) => HAS_AWS_S3_STORAGE_CLIENT
  ? awsS3UploadFromClient(file, PREFIX_UPLOAD, extension, true)
  : vercelBlobUploadFromClient(file, `${PREFIX_UPLOAD}.${extension}`);

export const convertUploadToPhoto = async (
  uploadUrl: string,
  photoId?: string,
): Promise<string> => {
  const fileName = photoId ? `${PREFIX_PHOTO}-${photoId}` : `${PREFIX_PHOTO}`;
  const fileExtension = getExtensionFromBlobUrl(uploadUrl);
  const fileNameAndExtension = `${fileName}.${fileExtension ?? 'jpg'}`;
  const photoUrl = `${NEXT_PUBLIC_UPYUN_PHOTO_PATH}/${fileNameAndExtension}`;

  const useAwsS3 = HAS_AWS_S3_STORAGE && isUrlFromAwsS3(uploadUrl);

  let url = '';
  if (HAS_UPYUN_STORAGE) {
    const tempUploadUrl = uploadUrl.replace(AWS_S3_BASE_URL,'');
    url = await (useAwsS3
      ? awsS3Move(tempUploadUrl, photoUrl, photoId === undefined)
      : vercelBlobCopy(uploadUrl, photoUrl, photoId === undefined));
  }

  if (!HAS_UPYUN_STORAGE) {
    url = await (useAwsS3
      ? awsS3Move(uploadUrl, photoUrl, photoId === undefined)
      : vercelBlobCopy(uploadUrl, photoUrl, photoId === undefined));

    await (useAwsS3
      ? awsS3Delete(getFileNameFromBlobUrl(uploadUrl))
      : vercelBlobDelete(uploadUrl));
  }

  return url;
};

export const deleteBlobUrl = (url: string) =>
  HAS_AWS_S3_STORAGE && isUrlFromAwsS3(url)
    ? awsS3Delete(getFileNameFromBlobUrl(url))
    : vercelBlobDelete(url);

export const getBlobUploadUrls = (): Promise<string[]> => HAS_AWS_S3_STORAGE
  ? awsS3List(`${PREFIX_UPLOAD}-`)
  : vercelBlobList(`${PREFIX_UPLOAD}-`);

export const getBlobPhotoUrls = (): Promise<string[]> => HAS_AWS_S3_STORAGE
  ? awsS3List(`${PREFIX_PHOTO}-`)
  : vercelBlobList(`${PREFIX_PHOTO}-`);
